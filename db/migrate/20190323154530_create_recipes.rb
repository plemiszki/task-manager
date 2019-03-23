class CreateRecipes < ActiveRecord::Migration[5.2]
  def change
    create_table :recipes do |t|
      t.string :category, default: ""
      t.text :ingredients, default: ""
      t.text :prep, default: ""
    end
  end
end
