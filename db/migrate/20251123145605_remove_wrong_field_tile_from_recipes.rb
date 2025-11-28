class RemoveWrongFieldTileFromRecipes < ActiveRecord::Migration[8.1]
  def change
    remove_column :recipes, :tile, :string
  end
end
