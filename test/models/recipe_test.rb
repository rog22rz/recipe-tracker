require "test_helper"

class RecipeTest < ActiveSupport::TestCase
  test "recipe can have many tags" do
    recipe = recipes(:japchae)
    assert_equal 2, recipe.tags.count
    assert_includes recipe.tags.pluck(:name), "dinner"
    assert_includes recipe.tags.pluck(:name), "korean"
  end

  test "recipe can have many cooking logs" do
    recipe = recipes(:japchae)
    assert_equal 2, recipe.cooking_logs.count
  end

  test "destroying recipe destroys associated cooking logs" do
    recipe = recipes(:japchae)
    cooking_log_count = recipe.cooking_logs.count

    assert_difference "CookingLog.count", -cooking_log_count do
      recipe.destroy
    end
  end

  test "destroying recipe destroys associated recipe_tags" do
    recipe = recipes(:japchae)
    recipe_tag_count = recipe.recipe_tags.count

    assert_difference "RecipeTag.count", -recipe_tag_count do
      recipe.destroy
    end
  end

  test "recipe can be created without ingredients" do
    recipe = Recipe.new(title: "Simple Recipe", instructions: "Do something")
    assert recipe.valid?
    assert recipe.save
  end

  test "recipe can be created without instructions" do
    recipe = Recipe.new(title: "Simple Recipe", ingredients: "Something")
    assert recipe.valid?
    assert recipe.save
  end
end
