# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2020_12_05_154207) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "future_tasks", id: :serial, force: :cascade do |t|
    t.string "text", null: false
    t.string "timeframe", default: "day"
    t.string "color", default: "210, 206, 200"
    t.integer "user_id"
    t.date "date", null: false
    t.boolean "add_to_end", default: false
  end

  create_table "recipes", force: :cascade do |t|
    t.string "category", default: ""
    t.text "ingredients", default: ""
    t.text "prep", default: ""
    t.string "name", null: false
    t.string "time", default: ""
  end

  create_table "recurring_tasks", id: :serial, force: :cascade do |t|
    t.string "text", null: false
    t.string "color", default: "210, 206, 200"
    t.string "timeframe", default: "day"
    t.integer "user_id", null: false
    t.integer "position"
    t.string "recurrence", null: false
    t.boolean "add_to_end", default: false
    t.boolean "expires", default: false
    t.integer "joint_user_id"
    t.string "joint_text"
    t.boolean "active", default: true
  end

  create_table "tasks", id: :serial, force: :cascade do |t|
    t.string "text", null: false
    t.string "timeframe", default: "day"
    t.string "color", default: "yellow"
    t.integer "parent_id"
    t.integer "duplicate_id"
    t.integer "position", default: 0
    t.boolean "complete", default: false
    t.boolean "template", default: false
    t.boolean "expanded", default: false
    t.integer "user_id", null: false
    t.integer "joint_id"
    t.index ["duplicate_id"], name: "index_tasks_on_duplicate_id"
    t.index ["parent_id"], name: "index_tasks_on_parent_id"
    t.index ["user_id"], name: "index_tasks_on_user_id"
  end

  create_table "users", id: :serial, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "email", null: false
    t.string "encrypted_password", limit: 128, null: false
    t.string "confirmation_token", limit: 128
    t.string "remember_token", limit: 128, null: false
    t.boolean "long_weekend"
    t.index ["email"], name: "index_users_on_email"
    t.index ["remember_token"], name: "index_users_on_remember_token"
  end

end
