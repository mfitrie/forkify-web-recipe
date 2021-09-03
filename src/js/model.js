import { async } from "regenerator-runtime"
import { API_URL, RES_PER_PAGE, KEY } from "./config.js";
// import { getJSON, sendJSON } from "./helpers.js";
import { AJAX } from "./helpers.js";

export const state = {
    recipe: {},
    search: {
        query: '',
        results: [],
        page: 1,
        resultsPerPage: RES_PER_PAGE,
    },
    bookmarks: []
}

const createRecipeObject = function(data){
    const {recipe} = data.data; // destructuring and renaming the object

        // console.log(recipe);
        return  {
            id: recipe.id,
            title: recipe.title,
            publisher: recipe.publisher,
            sourceUrl: recipe.source_url,
            image: recipe.image_url,
            cookingTime: recipe.cooking_time,
            ingredients: recipe.ingredients,
            servings: recipe.servings,
            ...(recipe.key && {key: recipe.key}), // Using the short circuiting
        }
}

export const loadRecipe = async function(id){
    try {
        const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
        state.recipe = createRecipeObject(data);

        // const res = await fetch(`${API_URL}/${id}`); // https://forkify-api.herokuapp.com/api/v2/recipes/5ed6604591c37cdc054bc886 

        // const data = await res.json();

        // if(!res.ok) throw new Error(`${data.message} (${res.status})`);

        // console.log(res, data);

        if(state.bookmarks.some(bookmark => bookmark.id === id))
            state.recipe.bookmarks = true;
        else
            state.recipe.bookmarks = false;
    
        console.log(state.recipe);
} catch (err) {
    console.error(`${err} 😒`);
    // alert(err);
    throw err; // rethrow the error
};
};


export const loadSearchResults = async function(query){
    try {
        state.search.query = query; // store the query

        const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
        console.log(data);

        state.search.results = data.data.recipes.map(rec => {
            return {
                id: rec.id,
                title: rec.title,
                publisher: rec.publisher,
                image: rec.image_url,
                ...(rec.key && {key: rec.key})
            }
        }); // store search results into array

        state.search.page = 1; // Reset the page to 1
    } catch (err) {
        console.error(`${err} 😒`);
        throw err;
    }
};

export const getSearchResultsPage = function(page = state.search.page){
    state.search.page = page; // current page

    const start = (page -1) * state.search.resultsPerPage; // 0;
    const end = page * state.search.resultsPerPage; // 9;


    return state.search.results.slice(start, end); // return the results per page
}

export const updateServings = function(newServings){
    state.recipe.ingredients.forEach(ing => {
        ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
        // newQt = oldQt * newServings / oldServings // 2 * 8 / 4 = 4
    });

    state.recipe.servings = newServings;
}

const persistBookmarks = function(){
    localStorage.setItem('bookmarks',JSON.stringify(state.bookmarks));
}

export const addBookmark = function(recipe){
    // Add bookmark
    state.bookmarks.push(recipe);

    // Mark current recipe as bookmark
    if(recipe.id === state.recipe.id) state.recipe.bookmarks = true;

    persistBookmarks();
}

export const deleteBookmark = function(id){
    // Delete bookmark
    const index = state.bookmarks.findIndex(el => el.id === id)
    state.bookmarks.splice(index, 1);

    // Mark current recipe as NOT bookmarked
    if(id === state.recipe.id) state.recipe.bookmarks = false;

    persistBookmarks();
};

const init = function(){
    const storage = localStorage.getItem('bookmarks');
    if(storage) state.bookmarks = JSON.parse(storage);
};
init();
// console.log(state.bookmarks);

const clearBookmarks = function(){
    localStorage.clear('bookmarks');
}
// clearBookmarks();

export const uploadRecipe = async function(newRecipe){
    try{
        const ingredients = Object.entries(newRecipe)
        .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
        .map(ing => {
            // const ingArr = ing[1].replaceAll(' ', '').split(',');
            const ingArr = ing[1].split(',').map(el => el.trim());
            if(ingArr.length !== 3) throw new Error('Wrong ingredient format! Please use the correct format ;)');

            const [quantity, unit, description] = ingArr;
            return {quantity: quantity ? +quantity : null, unit, description};
        }); // Object.entries, convert the object to Array

        const recipe = {
            title: newRecipe.title,
            source_url: newRecipe.sourceUrl,
            image_url: newRecipe.image,
            publisher: newRecipe.publisher,
            cooking_time: +newRecipe.cookingTime,
            servings: +newRecipe.servings,
            ingredients,
        };

        // console.log(recipe);
        const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
        // console.log(data);
        state.recipe = createRecipeObject(data);
        addBookmark(state.recipe);
    }
    catch(err){
        throw err;
    }

    
}