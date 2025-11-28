class RemoveDescriptionFromRecipes < ActiveRecord::Migration[8.1]
  def change
    remove_column :recipes, :description, :string
  end
end
