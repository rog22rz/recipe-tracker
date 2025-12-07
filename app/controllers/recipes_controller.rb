class RecipesController < ApplicationController
  def index
    @recipes = Recipe.all
    @tags = Tag.joins(:recipes).distinct.order(:name)

    if params[:tag].present?
      @recipes = @recipes.joins(:tags).where(tags: { name: params[:tag] })
      @current_tag = params[:tag]
    end
  end

  def show
    @recipe = Recipe.find(params[:id])
  end

  def new
    @recipe = Recipe.new
  end

  def create
    @recipe = Recipe.new(recipe_params)
    if @recipe.save
      update_tags
      redirect_to @recipe, notice: "Recipe was successfully created."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    @recipe = Recipe.find(params[:id])
  end

  def update
    @recipe = Recipe.find(params[:id])
    if @recipe.update(recipe_params)
      update_tags
      redirect_to @recipe, notice: "Recipe was successfully updated."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @recipe = Recipe.find(params[:id])
    @recipe.destroy
    redirect_to recipes_path, notice: "Recipe was successfully deleted."
  end

  private

  def recipe_params
    params.require(:recipe).permit(:title, :ingredients, :instructions)
  end

  def update_tags
    return unless params[:tag_list]

    tag_names = params[:tag_list].split(",").map(&:strip).reject(&:blank?)
    @recipe.tags = tag_names.map { |name| Tag.find_or_create_by(name: name.downcase) }
  end
end

