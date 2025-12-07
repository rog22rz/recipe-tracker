require "test_helper"

class RecipeTagTest < ActiveSupport::TestCase
  test "recipe_tag belongs to recipe and tag" do
    recipe_tag = recipe_tags(:japchae_dinner)
    assert_equal recipes(:japchae), recipe_tag.recipe
    assert_equal tags(:dinner), recipe_tag.tag
  end

  test "recipe_tag requires a recipe" do
    recipe_tag = RecipeTag.new(tag: tags(:dinner))
    assert_not recipe_tag.valid?
  end

  test "recipe_tag requires a tag" do
    recipe_tag = RecipeTag.new(recipe: recipes(:japchae))
    assert_not recipe_tag.valid?
  end
end
