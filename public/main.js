
$(document).ready(function () {
  $('#searchBtn').click(function () {
      $('.hunter-results-container').hide();
      $('.yelp-results-container').hide();
      var searchType = $('.search-is-selected').data().searchType;
      var search = $('#searchInput').val();
      var city = $('#cityInput').val();
      var state = $('#stateInput').val();
      if (searchType === 'unified') {
        unifiedSearch(search);
      } else if (searchType === 'hunter') {
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

function unifiedSearch(businessURL) {
  $.ajax({
      url: 'http://localhost:8080/unified?businessUrl=' + businessURL,
      success: handleUnifiedData,
  });
}

function handleUnifiedData(results) {
  parseUnifiedResults(results.data, results);
}

function parseUnifiedResults(hunterData, fullContactData) {
  var contacts = [];
  for (var email of hunterData.emails) {
    var contact = {};
    if (typeof email.first_name !== undefined && email.first_name) {
      contact.firstname = email.first_name;
    }
    if (typeof email.last_name !== undefined && email.last_name) {
      contact.lastname = email.last_name;
    }
    if (typeof email.value !== undefined && email.value) {
      contact.email = email.value;
    }
    if (typeof email.phone_number !== undefined && email.phone_number) {
      contact.phonenumber = email.phone_number;
    }
    if (typeof email.position !== undefined && email.position) {
      contact.position = email.position;
    }
    if (typeof email.linkedin !== undefined && email.linkedin) {
      contact.linkedin = email.linkedin;
    }
    if (typeof email.twitter !== undefined && email.twitter) {
      contact.twitter = email.twitter;
    }
    if (typeof email.confidence !== undefined && email.confidence) {
      contact.hunterConfidence = email.confidence;
    }
    contacts.push(contact);
  }

  var companyInfo = {};
  if (typeof fullContactData.website !== undefined && fullContactData.website) {
    companyInfo.website = fullContactData.website;
  }
  if (typeof fullContactData.organization.name !== undefined && fullContactData.organization.name) {
    companyInfo.name = fullContactData.organization.name;
  }
  if (typeof fullContactData.organization.approxEmployees !== undefined && fullContactData.organization.approxEmployees) {
    companyInfo.approxEmployees = fullContactData.organization.approxEmployees;
  }
  if (typeof fullContactData.organization.overview !== undefined && fullContactData.organization.overview) {
    companyInfo.overview = fullContactData.organization.overview;
  }

  var addresses = [];
  if (typeof fullContactData.organization.contactInfo.addresses !== undefined && fullContactData.organization.contactInfo.addresses !== null && fullContactData.organization.contactInfo.addresses.length > 0) {
    for (let address of fullContactData.organization.contactInfo.addresses) {
      addresses.push(address)
    }
  }

  var phoneNumbers = [];
  if (typeof fullContactData.organization.contactInfo.phoneNumbers !== undefined && fullContactData.organization.contactInfo.phoneNumbers !== null && fullContactData.organization.contactInfo.phoneNumbers.length > 0) {
    for (let phoneNumber of fullContactData.organization.contactInfo.phoneNumbers) {
      phoneNumbers.push(phoneNumber)
    }
  }

  var images = [];
  if (typeof fullContactData.organization.images !== undefined && fullContactData.organization.images !== null && fullContactData.organization.images.length > 0) {
    for (let image of fullContactData.organization.images) {
      images.push(image)
    }
  }

  var company = {
    companyInfo: companyInfo,
    contacts: contacts,
    addresses: addresses,
    phoneNumbers: phoneNumbers,
    images: images
  }
  console.log(company);
  addUnifiedResults(company)
}

function addUnifiedResults(company) {
  var companyImage = '';
  if (company.images.length > 0) {
    companyImage = company.images[0].url;
  }
  var html = '' +
    '<div class="unified-company">' +
      '<div class="unified-company-header">' + 
        '<div class="row">' +
          '<h3>COMPANY INFO</h3>' +
          '<div class="col">' +
            '<img src="' + companyImage + '" />' +
          '</div>' +
          '<div class="col">' +
            '<span class="unified-company-name">' + company.companyInfo.name + '</span>' +
            '<span class="unified-company-overview">' + company.companyInfo.overview + '</span>' +
            '<span class="unified-company-website"><a href="' + company.companyInfo.website + '" target="_blank">' + company.companyInfo.website + '</a></span>' +
            '<span class="unified-company-employees">Approx Employees: ' + company.companyInfo.approxEmployees + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="unified-company-addresses"></div>' +
      '<div class="unified-company-numbers"></div>' +
      '<div class="unified-company-contacts"></div>' +
    '</div>';
  $('#unifiedTable').append(html);

  var html = '<h3>COMPANY ADDRESSES</h3>';
  $('.unified-company-addresses').append(html);

  for (var address of company.addresses) {
    var state = '';
    if (typeof address.region !== 'undefined' && typeof address.region.code !== 'undefined' && address.region.code) {
      state = address.region.code;
    }
    var html = '' +
      '<div class="unified-company-address">' +
        '<span class="unified-company-address-line1">' + address.addressLine1 + '</span>' +
        '<span class="unified-company-address-line2">' + address.addressLine2 + '</span>' +
        '<span class="unified-company-address-citystate">' + address.locality + ', ' + state + ' ' + address.postalCode + '</span>' +
      '</div>';
    $('.unified-company-addresses').append(html);
  }

  var html = '<h3>COMPANY NUMBERS</h3>';
  $('.unified-company-numbers').append(html);

  for (var number of company.phoneNumbers) {
    var html = '' +
      '<div class="unified-company-number">' +
        '<span>' + number.number + '</span>' +
      '</div>';
    $('.unified-company-numbers').append(html);
  }

  var html = '<h3>COMPANY CONTACTS</h3>';
  $('.unified-company-contacts').append(html);

  for (var contact of company.contacts) {
    var html = '' +
      '<div class="unified-company-contact">' +
        '<span class="unified-company-contact-email"><a href="mailto:' + contact.email + '">' + contact.email + '</a></span>' +
      '</div>';
    $('.unified-company-contacts').append(html);
  }
}