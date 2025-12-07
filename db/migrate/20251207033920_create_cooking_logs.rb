class CreateCookingLogs < ActiveRecord::Migration[8.1]
  def change
    create_table :cooking_logs do |t|
      t.references :recipe, null: false, foreign_key: true
      t.date :cooked_at

      t.timestamps
    end
  end
end
