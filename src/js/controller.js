import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationViews from './views/paginationViews.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable'; // is to polyfilling anything else
import 'regenerator-runtime/runtime'; // is to polyfilling async/await
import { async } from 'regenerator-runtime';


// const recipeContainer = document.querySelector('.recipe');



// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

// Parcel Code///////
// if(module.hot){
//   module.hot.accept();
// }
/////////////////////

const controlRecipe = async function(){
  try {

    const id = window.location.hash.slice(1);
    console.log(id);

    if(!id) return;

    recipeView.renderSpinner();

    // 0) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    
    // 1) Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);
    
    // 2) loading recipe
    await model.loadRecipe(id); // this Promise does not return anything, but get access to state.recipe and will be manipulated
    // const {recipe} = model.state;
    
    // 3) Rendering recipe
    recipeView.render(model.state.recipe); // data of model will be passed to the render method
    

  } catch (err) {
    // alert(err);
    recipeView.renderError('We could not find that recipe. Please try another one!');
  }


};
// controlRecipe();


const controlSearhResults = async function(){
  
  try {
    
    resultsView.renderSpinner();

    // 1) Get search query
    const query = searchView.getQuery();
    if(!query) return;

    // 2) Load search results
    await model.loadSearchResults(query);

    // 3) Render results
    // console.log(model.state.search.results);
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage(3));


    // 4) Render initial pagination buttons
    paginationViews.render(model.state.search);

  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function(goToPage){

  // 1) Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage)); // passing the page

  // 2) Render NEW pagination buttons
  paginationViews.render(model.state.search);
}

const controlServings = function(newServings){
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);

}

const controlAddBookmark = function(){
  // 1) Add/remove bookmark
  if(!model.state.recipe.bookmarks) model.addBookmark(model.state.recipe); // Add the current recipe as a bookmark
  else model.deleteBookmark(model.state.recipe.id); 

  // console.log(model.state.recipe);
  // 2) Update recipe view
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
}

const controlBookmarks = function(){
  bookmarksView.render(model.state.bookmarks);
}

const controlAddRecipe = async function(newRecipe){
  // console.log(newRecipe);

  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    
    // Success message
    addRecipeView.renderMessage();
    
    // Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`); // Change the url without reloading the page
    
    // Close form window
    setTimeout(function(){
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000 );
    
  } catch (err) {
    console.error('👀' ,err);
    addRecipeView.renderError(err.message);
  }

};

const newFeature = function(){
  console.log('welcome to the application');
}

const init = function(){
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipe);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearhResults);
  paginationViews.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  newFeature();
};
init();

// window.addEventListener('hashchange',controlRecipe); // listen to hash
// window.addEventListener('load',controlRecipe);
