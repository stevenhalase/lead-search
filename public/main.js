
$(document).ready(function () {
  $('#searchBtn').click(function () {
      $('.hunter-results-container').hide();
      $('.yelp-results-container').hide();
      var searchType = $('.search-is-selected').data().searchType;
      var search = $('#searchInput').val();
      var city = $('#cityInput').val();
      var state = $('#stateInput').val();
      if (searchType === 'hunter') {
        domainSearch(search);
      } else if (searchType === 'yelp') {
        yelpSearch(search, city, state);
      }
  });

  $('.search-selection-button').click(function() {
    $('.search-selection-button').removeClass('search-is-selected');
    $(this).addClass('search-is-selected');

    var searchType = $('.search-is-selected').data().searchType;
    if (searchType === 'yelp') {
        $('#cityStateGroup').show();
      } else {
        $('#cityStateGroup').hide();
      }
  })
})

function yelpSearch(searchTerm, city, state)  {
    if (city === '' || state === '') {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(handleGeolocation);
      }
    } else {
      doYelpSearchCityState(searchTerm, city, state);
    }
    
}

function handleGeolocation(position) {
  var lat = position.coords.latitude;
  var lng = position.coords.longitude;
  var search = $('#searchInput').val();
  doYelpSearchCoords(search, lat, lng);
}

function doYelpSearchCoords(searchTerm, lat, lng) {
  $.ajax({
      url: 'http://localhost:8080/yelp?searchTerm=' + searchTerm + '&lat=' + lat + '&lng=' + lng,
      success: handleYelpData,
  });
}

function doYelpSearchCityState(searchTerm, city, state) {
  $.ajax({
      url: 'http://localhost:8080/yelp?searchTerm=' + searchTerm + '&location=' + city + ',' + state,
      success: handleYelpData,
  });
}

function handleYelpData(data) {
    var businesses = data.businesses;
    console.log(businesses)
    for (var business of businesses) {
        $('#businessesTable').append('<div class="business-container"><div class="row"><div class="col">' +
            '<img src="' + business.image_url + '" /></div><div class="col">' +
            '<a href="' + business.url + '" target="_blank"><span class="business-name">' + business.name + '</span></a>' +
            '<span class="business-phone">' + business.display_phone + '</span>' +
            '<span class="business-display-address-1">' + business.location.display_address[0] + '</span>' +
            '<span class="business-display-address-2">' + business.location.display_address[1] + '</span>' +
            '</div></div></div>')
    }
    $('.yelp-results-container').show();
}

function domainSearch(businessURL) {
    $.ajax({
        url: 'http://localhost:8080/hunter?businessUrl=' + businessURL,
        success: handleHunterData,
    });
}

function handleHunterData(results) {
    var contacts = results.data.emails;
    addEmailResults(contacts);
}

function addEmailResults(contacts) {
    var ind = 1;
    for (var contact of contacts) {
        
        for(var key in contact) {
            if (contact[key] === null) {
                contact[key] = '';
            }
        }

        $('#emailsTable tbody').append('<tr>' +
            '<th scope="row">' + ind + '</th>' +
            '<td>' + contact.confidence + '</td>' +
            '<td>' + contact.position + '</td>' +
            '<td><a href="mailto:' + contact.value + '">' + contact.value + '</a></td>' +
            '<td>' + contact.first_name + '</td>' +
            '<td>' + contact.last_name + '</td>' +
            '<td>' + contact.phone_number + '</td>' +
            '<td><a href="' + contact.linkedin + '" target="_blank">' + contact.linkedin + '</a></td>' +
            '<td><a href="' + contact.twitter + '" target="_blank">' + contact.twitter + '</a></td>' +
            '</tr>')
        ind++
    }
    $('.hunter-results-container').show();
}