$(document).ready(function() {
	var item, tile, author, publisher, bookLink, bookImage; //data
	var outputList = document.getElementById("list-output");
	var bookUrl = "https://www.googleapis.com/books/v1/volumes?q=";
	var apiKey = "key=AIzaSyDtXC7kb6a7xKJdm_Le6_BYoY5biz6s8Lw"; //apiKey
	var placeHldr = '<img src="https://via.placeholder.com/150">';
	var searchData;

	//listen for the search bar
	$("#search").click(function() {
		outputList.innerHTML = ""; //empty html output
		document.body.style.backgroundImage = "url('')"; // used to display the results of a search on the following page
		searchData = $("#search-box").val(); //take input from a user

		//dealing with an empty search input field
		if (searchData === "" || searchData === null) {
			displayError();
		} else {

			$.ajax({ // ajax jquery function that takes book url  and search data
				url: bookUrl + searchData,
				dataType: "json",
				success: function(response) { //console log what we did get from ajax request
					console.log(response)
					if (response.totalItems === 0) { //if response contains null then no result
						alert("no result, please try again!!!")
					} else {
						$("#title").animate({
							'margin-top': '3px'
						}, 1000); //search box animation
						$(".book-list").css("visibility", "visible");
						displayResults(response);
					}
				},
				//in case if there is an error
				error: function() {
					alert("Something went wrong, so please try again!");
				}
			});
		}
		$("#search-box").val(""); //to empty the search box
	});

	// function that will display the results in html
	function displayResults(response) {
		for (var i = 0; i < response.items.length; i++) { // for every row we have 2 cards, logically we should display 2 books in 1 row, for every iteration we should get the information about books. index[0] and index[1]
			//getting the necessary info about book
			item = response.items[i];
			title1 = item.volumeInfo.title;
			author1 = item.volumeInfo.authors;
			publisher1 = item.volumeInfo.publisher;
			bookLink1 = item.volumeInfo.previewLink;
			bookIsbn = item.volumeInfo.industryIdentifiers[1].identifier
			bookImage1 = (item.volumeInfo.imageLinks) ? item.volumeInfo.imageLinks.thumbnail : placeHldr;


			item2 = response.items[i + 1];
			title2 = item2.volumeInfo.title;
			author2 = item2.volumeInfo.authors;
			publisher2 = item2.volumeInfo.publisher;
			bookLink2 = item2.volumeInfo.previewLink;
			bookIsbn2 = item2.volumeInfo.industryIdentifiers[1].identifier
			bookImage2 = (item2.volumeInfo.imageLinks) ? item2.volumeInfo.imageLinks.thumbnail : placeHldr;

			//to ouput the books from API
			outputList.innerHTML += '<div class="row mt-4">' +
				formatOutput(bookImage1, title1, author1, publisher1, bookLink1, bookIsbn) + //formatOutput is an template in which it's possible to include JS variables
				formatOutput(bookImage2, title2, author2, publisher2, bookLink2, bookIsbn2) +
				'</div>';

			console.log(outputList);
		}
	}


	function formatOutput(bookImg, title, author, publisher, bookLink, bookIsbn) {
		
		// console.log(title + ""+ author +" "+ publisher +" "+ bookLink+" "+ bookImg)
		var viewUrl = 'book.html?isbn=' + bookIsbn; //constructing link for bookviewer
		var htmlCard = `<div class="col-lg-6">
       <div class="card" style="">
         <div class="row no-gutters">
           <div class="col-md-4">
             <img src="${bookImg}" class="card-img" alt="...">
           </div>
           <div class="col-md-8">
             <div class="card-body">
               <h5 class="card-title">${title}</h5>
               <p class="card-text">Author: ${author}</p>
               <p class="card-text">Publisher: ${publisher}</p>
			<div style="display: flex;">
               <a target="_blank" href="${viewUrl}" class="btn btn-secondary">Read Book</a>
				<form action="/adding" method="post" style="margin-left: 5%">
					<input id="Image" name="Image" type="hidden" value="${bookImg}">
					<input id="Author" name="Author" type="hidden" value="${author}">
					<input id="Title" name="Title" type="hidden" value="${title}">
					<input id="Publisher" name="Publisher" type="hidden" value="${publisher}">
					<input id="Link" name="Link" type="hidden" value="${viewUrl}">
					<input id="Isbn" name="Isbn" type="hidden" value="${bookIsbn}">
					<button type="submit" class="btn btn-secondary">Add to Collection</button>
				</form>
			</div>
             </div>
           </div>
         </div>
       </div>
     </div>`
		return htmlCard;
	}

	// if search box is empty, then give an erro
	function displayError() {
		alert("Search field cannot be empty!")
	}

});