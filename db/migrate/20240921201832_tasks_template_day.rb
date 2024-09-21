class TasksTemplateDay < ActiveRecord::Migration[7.1]
  def change
    add_column :tasks, :template_date, :date
  end
end
