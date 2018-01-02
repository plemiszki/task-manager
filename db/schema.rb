# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20180102203228) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "future_tasks", force: :cascade do |t|
    t.string  "text",                                 null: false
    t.string  "timeframe",  default: "day"
    t.string  "color",      default: "210, 206, 200"
    t.integer "user_id"
    t.date    "date",                                 null: false
    t.boolean "add_to_end", default: false
  end

  create_table "tasks", force: :cascade do |t|
    t.string  "text",                            null: false
    t.string  "timeframe",    default: "day"
    t.string  "color",        default: "yellow"
    t.integer "parent_id"
    t.integer "duplicate_id"
    t.integer "order",        default: 0
    t.boolean "complete",     default: false
    t.boolean "template",     default: false
    t.boolean "expanded",     default: false
    t.integer "user_id",                         null: false
    t.integer "joint_id"
  end

  add_index "tasks", ["duplicate_id"], name: "index_tasks_on_duplicate_id", using: :btree
  add_index "tasks", ["parent_id"], name: "index_tasks_on_parent_id", using: :btree
  add_index "tasks", ["user_id"], name: "index_tasks_on_user_id", using: :btree

  create_table "users", force: :cascade do |t|
    t.datetime "created_at",                     null: false
    t.datetime "updated_at",                     null: false
    t.string   "email",                          null: false
    t.string   "encrypted_password", limit: 128, null: false
    t.string   "confirmation_token", limit: 128
    t.string   "remember_token",     limit: 128, null: false
    t.boolean  "long_weekend"
  end

  add_index "users", ["email"], name: "index_users_on_email", using: :btree
  add_index "users", ["remember_token"], name: "index_users_on_remember_token", using: :btree

end
