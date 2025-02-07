class CreateJobs < ActiveRecord::Migration[7.1]
  def change
    create_table "jobs", id: :serial, force: :cascade do |t|
      t.string "job_id", null: false
      t.string "first_line"
      t.boolean "second_line", default: false
      t.integer "current_value", default: 0
      t.integer "total_value", default: 0
      t.string "errors_text", default: ""
      t.string "name"
      t.jsonb "metadata"
      t.integer "status", default: 0
    end
  end
end
