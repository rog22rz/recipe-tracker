class RemoveWrongFieldFromRecipes < ActiveRecord::Migration[8.1]
  def change
    remove_column :recipes, :wrong_field, :string
  end
end
