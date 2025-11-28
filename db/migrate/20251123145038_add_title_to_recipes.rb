class AddTitleToRecipes < ActiveRecord::Migration[8.1]
  def change
    add_column :recipes, :title, :string
  end
end
