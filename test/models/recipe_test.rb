require "test_helper"

class RecipeTest < ActiveSupport::TestCase
  test "recipe belongs to user" do
    recipe = recipes(:japchae)
    assert_equal users(:one), recipe.user
  end

  test "recipe requires user" do
    recipe = Recipe.new(title: "No User Recipe")
    assert_not recipe.valid?
    assert_includes recipe.errors[:user], "must exist"
  end

  test "recipe can have many tags" do
    recipe = recipes(:japchae)
    recipe.tags.clear
    recipe.tags << Tag.find_or_create_by(name: "dinner")
    recipe.tags << Tag.find_or_create_by(name: "korean")
    assert_equal 2, recipe.tags.count
  end

  test "recipe can have many cooking logs" do
    recipe = recipes(:japchae)
    assert recipe.cooking_logs.count >= 0
  end

  test "destroying recipe destroys associated cooking logs" do
    recipe = recipes(:japchae)
    recipe.cooking_logs.create!(cooked_at: Date.current)
    cooking_log_count = recipe.cooking_logs.count

    assert_difference "CookingLog.count", -cooking_log_count do
      recipe.destroy
    end
  end

  test "destroying recipe destroys associated recipe_tags" do
    recipe = recipes(:japchae)
    recipe.tags << Tag.find_or_create_by(name: "test")
    recipe_tag_count = recipe.recipe_tags.count

    assert_difference "RecipeTag.count", -recipe_tag_count do
      recipe.destroy
    end
  end

  test "recipe can be created without ingredients" do
    recipe = Recipe.new(title: "Simple Recipe", instructions: "Do something", user: users(:one))
    assert recipe.valid?
    assert recipe.save
  end

  test "recipe can be created without instructions" do
    recipe = Recipe.new(title: "Simple Recipe", ingredients: "Something", user: users(:one))
    assert recipe.valid?
    assert recipe.save
  end
end
