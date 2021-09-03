import icons from '../../img/icons.svg'; // importing icon

export default class View{
    _data;

    render(data, render = true){
        if(!data || (Array.isArray(data) && data.length === 0)) return this.renderError();

        this._data = data; // it receive from the controller
        const markup = this._generateMarkup();

      if(!render) return markup;

        this._clear();
        this._parentElement.insertAdjacentHTML('afterbegin', markup);
    }

    update(data){
      
        this._data = data; // it receive from the controller
        const newMarkup = this._generateMarkup();

        const newDOM = document.createRange().createContextualFragment(newMarkup); // this method will then convert this String into real DOM object
        const newElements = Array.from(newDOM.querySelectorAll('*'));
        // console.log(newElements);
        const curElements = Array.from(this._parentElement.querySelectorAll('*'));
        // console.log(curElements);
        // console.log(newElements);

        newElements.forEach((newEl, i) => {
          const curEl = curElements[i];
          // console.log(curEl, newEl.isEqualNode(curEl)); // Comparing newEl with curEl 

          //  Updates changed TEXT
          if(!newEl.isEqualNode(curEl) && newEl.firstChild?.nodeValue.trim() !== ''){
            // console.log('🤧' ,newEl.firstChild.nodeValue.trim());
            curEl.textContent = newEl.textContent;
          }

          // Updates changed ATTRIBUTES
          if(!newEl.isEqualNode(curEl)){
            // console.log(newEl.attributes);
            // console.log(Array.from(newEl.attributes));
            Array.from(newEl.attributes).forEach(attr => curEl.setAttribute(attr.name, attr.value));
          };
        });
    }

    _clear(){
        // console.log(this._parentElement);
        this._parentElement.innerHTML = '';
    }

    renderSpinner(){
        const markup = `
          <div class="spinner">
            <svg>
              <use href="${icons}#icon-loader"></use>
            </svg>
          </div> 
        `;
        this._clear();
        this._parentElement.insertAdjacentHTML('afterbegin', markup);
      }
      
    renderError(message = this._errorMessage){
      const markup = `
      <div class="error">
        <div>
          <svg>
            <use href="${icons}#icon-alert-triangle"></use>
          </svg>
        </div>
        <p>${message}</p>
      </div> 
      `;
      this._clear();
        this._parentElement.insertAdjacentHTML('afterbegin', markup);
    }

    renderMessage(message = this._message){
      const markup = `
      <div class="message">
        <div>
          <svg>
            <use href="${icons}#icon-smile"></use>
          </svg>
        </div>
        <p>${message}</p>
      </div> 
      `;
      this._clear();
        this._parentElement.insertAdjacentHTML('afterbegin', markup);
    }
}