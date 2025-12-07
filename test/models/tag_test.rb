require "test_helper"

class TagTest < ActiveSupport::TestCase
  test "tag requires a name" do
    tag = Tag.new(name: nil)
    assert_not tag.valid?
    assert_includes tag.errors[:name], "can't be blank"
  end

  test "tag name must be unique" do
    Tag.create!(name: "unique")
    duplicate = Tag.new(name: "unique")
    assert_not duplicate.valid?
    assert_includes duplicate.errors[:name], "has already been taken"
  end

  test "tag name uniqueness is case insensitive" do
    # "dinner" already exists from fixtures, so try DINNER
    duplicate = Tag.new(name: "DINNER")
    assert_not duplicate.valid?
  end

  test "tag name is downcased before save" do
    tag = Tag.create!(name: "UPPERCASE")
    assert_equal "uppercase", tag.name
  end

  test "tag name is stripped before save" do
    tag = Tag.create!(name: "  spaced  ")
    assert_equal "spaced", tag.name
  end

  test "tag can have many recipes" do
    tag = tags(:dinner)
    assert_equal 1, tag.recipes.count
    assert_includes tag.recipes, recipes(:japchae)
  end

  test "destroying tag destroys associated recipe_tags" do
    tag = tags(:dinner)
    recipe_tag_count = tag.recipe_tags.count

    assert_difference "RecipeTag.count", -recipe_tag_count do
      tag.destroy
    end
  end

  test "destroying tag does not destroy recipes" do
    tag = tags(:dinner)

    assert_no_difference "Recipe.count" do
      tag.destroy
    end
  end
end
