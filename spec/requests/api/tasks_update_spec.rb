require "rails_helper"

RSpec.describe "PUT /api/tasks", type: :request do
  def sign_in_as(user)
    cookies["remember_token"] = user.remember_token
  end

  def create_task(user, attrs = {})
    Task.create!({
      user: user,
      timeframe: "day",
      text: "Task",
      position: 0,
      color: "255,0,0",
    }.merge(attrs))
  end

  let(:user) { User.create!(email: "task-update-spec@example.com", password: "password123") }

  before { sign_in_as(user) }

  it "does not update duplicates when only expanded changes" do
    original = create_task(user, expanded: false)
    duplicate = create_task(user, timeframe: "weekend", duplicate_id: original.id, expanded: false)

    put "/api/tasks", params: { task: { id: original.id, expanded: true } }

    expect(response).to have_http_status(:ok)
    patch_ids = JSON.parse(response.body)["tasks"]["patch"].map { |t| t["id"] }
    expect(patch_ids).to eq([original.id])
    expect(duplicate.reload.expanded).to eq(false)
    expect(original.reload.expanded).to eq(true)
  end

  it "does not clobber a joint task's completion state on a non-complete edit" do
    other_user = User.create!(email: "task-update-spec-2@example.com", password: "password123")
    task = create_task(user, complete: false)
    joint_task = create_task(other_user, complete: true)
    task.update!(joint_id: joint_task.id)
    joint_task.update!(joint_id: task.id)

    put "/api/tasks", params: { task: { id: task.id, text: "Updated text" } }

    expect(response).to have_http_status(:ok)
    expect(joint_task.reload.complete).to eq(true)
  end

  it "syncs a joint task's completion and includes it in the patch when complete changes" do
    other_user = User.create!(email: "task-update-spec-3@example.com", password: "password123")
    task = create_task(user, complete: false)
    joint_task = create_task(other_user, complete: false)
    task.update!(joint_id: joint_task.id)
    joint_task.update!(joint_id: task.id)

    put "/api/tasks", params: { task: { id: task.id, complete: true } }

    expect(response).to have_http_status(:ok)
    expect(joint_task.reload.complete).to eq(true)
    patch_ids = JSON.parse(response.body)["tasks"]["patch"].map { |t| t["id"] }
    expect(patch_ids).to include(joint_task.id)
  end

  it "marks the parent complete when the last incomplete sibling completes" do
    parent = create_task(user, text: "Parent", complete: false, expanded: true)
    create_task(user, text: "Sub1", position: 0, parent_id: parent.id, complete: true)
    sibling2 = create_task(user, text: "Sub2", position: 1, parent_id: parent.id, complete: false)

    put "/api/tasks", params: { task: { id: sibling2.id, complete: true } }

    expect(response).to have_http_status(:ok)
    expect(parent.reload.complete).to eq(true)
    patch_ids = JSON.parse(response.body)["tasks"]["patch"].map { |t| t["id"] }
    expect(patch_ids).to include(parent.id)
  end

  it "reports the completed task's post-rearrange position, not its stale pre-update position" do
    a = create_task(user, text: "A", position: 0, complete: false)
    b = create_task(user, text: "B", position: 1, complete: false)
    c = create_task(user, text: "C", position: 2, complete: false)

    put "/api/tasks", params: { task: { id: c.id, complete: true } }

    expect(response).to have_http_status(:ok)
    expect(c.reload.position).to eq(0)
    expect(a.reload.position).to eq(1)
    expect(b.reload.position).to eq(2)

    patch_by_id = JSON.parse(response.body)["tasks"]["patch"].index_by { |t| t["id"] }
    expect(patch_by_id[c.id]["position"]).to eq(0)
    expect(patch_by_id[a.id]["position"]).to eq(1)
    expect(patch_by_id[b.id]["position"]).to eq(2)
  end

  it "returns the full timeframe payload, not a patch, for the numbered-subtasks branch" do
    parent = create_task(user, text: "Parent")
    original = create_task(user, text: "Something", parent_id: parent.id)

    put "/api/tasks", params: { task: { id: original.id, text: "$-- Item$3" } }

    expect(response).to have_http_status(:ok)
    tasks = JSON.parse(response.body)["tasks"]
    expect(tasks).not_to have_key("patch")
    expect(tasks).to have_key("day")
  end
end
