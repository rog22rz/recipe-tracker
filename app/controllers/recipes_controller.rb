class RecipesController < ApplicationController
  before_action :set_recipe, only: [:show, :edit, :update, :destroy]

  def index
    @recipes = Current.user.recipes
    @tags = Tag.joins(:recipes).where(recipes: { user_id: Current.user.id }).distinct.order(:name)

    if params[:tag].present?
      @recipes = @recipes.joins(:tags).where(tags: { name: params[:tag] })
      @current_tag = params[:tag]
    end
  end

  def show
  end

  def new
    @recipe = Current.user.recipes.build
  end

  def create
    @recipe = Current.user.recipes.build(recipe_params)
    if @recipe.save
      update_tags
      redirect_to @recipe, notice: "Recipe was successfully created."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @recipe.update(recipe_params)
      update_tags
      redirect_to @recipe, notice: "Recipe was successfully updated."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @recipe.destroy
    redirect_to recipes_path, notice: "Recipe was successfully deleted."
  end

  private

  def set_recipe
    @recipe = Current.user.recipes.find(params[:id])
  end

  def recipe_params
    params.require(:recipe).permit(:title, :ingredients, :instructions)
  end

  def update_tags
    return unless params[:tag_list]

    tag_names = params[:tag_list].split(",").map(&:strip).reject(&:blank?)
    @recipe.tags = tag_names.map { |name| Tag.find_or_create_by(name: name.downcase) }
  end
end
