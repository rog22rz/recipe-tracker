class AddIngredientsToRecipes < ActiveRecord::Migration[8.1]
  def change
    add_column :recipes, :ingredients, :text
  end
end
