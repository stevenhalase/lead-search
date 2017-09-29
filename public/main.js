
$(document).ready(function () {
    yelpSearch('something');
    // $('#searchBtn').click(function () {
    //     var search = $('#searchInput').val();
    //     domainSearch(search);
    // });
})

function getYelpToken() {
    $.ajax({
        type: 'POST',
        contentType: 'application/x-www-form-urlencoded',
        url: 'https://api.yelp.com/oauth2/token?grant_type=client_credentials&client_id=WWcW2n1i-VxHNA1520GXJA&client_secret=8vM6ZF3SjcEymx2E9ul5X3PQnYvDbTZxEHqBkKeugKCGluKpqNxr414eNXnrIiNz',
        // crossDomain: true,
        // dataType: "jsonp"
    });
}

function handleYelpTokenData(result) {
    console.log(result)
}

function yelpSearch(searchTerm)  {
    $.ajax({
        url: 'http://localhost:8080/yelp?searchTerm=' + searchTerm,
        success: handleHunterData,
    });
}

function handleYelpData(data) {
    console.log(data);
}

function domainSearch(businessURL) {
    $.ajax({
        url: 'https://api.hunter.io/v2/domain-search?domain=' + businessURL + '&api_key=ae2f419b22fcf725379b54db12a63212d008c72d&limit=50',
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
}