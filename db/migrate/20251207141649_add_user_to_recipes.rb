class AddUserToRecipes < ActiveRecord::Migration[8.1]
  def up
    # Add the column allowing null first
    add_reference :recipes, :user, foreign_key: true

    # Create a default user for existing recipes
    default_user = User.find_or_create_by!(email_address: "default@example.com") do |user|
      user.password = "password123"
    end

    # Assign all existing recipes to the default user
    Recipe.where(user_id: nil).update_all(user_id: default_user.id)

    # Now add the not null constraint
    change_column_null :recipes, :user_id, false
  end

  def down
    remove_reference :recipes, :user
  end
end
