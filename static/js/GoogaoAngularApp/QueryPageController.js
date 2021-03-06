app.controller("queryPageCtrl", function($scope, $http, $location, $window){
  $scope.search_results = []
  $scope.results_images = []
  $scope.img_chosen = false;
  $scope.focused_img_index = -1;
  $scope.page_number = 0;
  $scope.results_page_title = ""
  $scope.no_results = false;
  $scope.login_display = false;
  $scope.login_success = true;
  $scope.user_name = "Sign in";
  $scope.login_submit = "Login"
  $scope.no_account = true;
  $scope.request_time = 0;
  $scope.signed_in = false;
  $scope.most_popular = [];
  $scope.history = [];
  $scope.news_articles = []
  $scope.forecast = []


  $scope.googao_form_submit = function(e, username) {
    if ($scope.login_submit === "Login") {
      $scope.googaoLogin(e, username, "/googaoLogin")
    }
    else {
      $scope.googaoLogin(e, username, "/googaoSignup")
    }
  }

  $scope.googaoLogin = function(e, username, req_url) {
	  console.log("Googao Login Time Baby");
	  e.preventDefault();

	  $http({
		  method : "POST",
	      url : req_url,
	      data : { "username" : username}

	  }).then(function onSuccess(response){
		  var data = response.data;
		  if (data.success == true) {
			  $scope.close_login();
			  $scope.user_name = username;
			  $scope.signed_in = true;
		  } else {
			  $scope.login_success = false;
		  }

	  });
  }

  $scope.search = function(e, query_string) {
    console.log("in function");
    console.log("fuck this");
    console.log($scope.signed_in)
    e.preventDefault();
    var start = performance.now();
    $http({
      method : "POST",
      url : "/query",
      data : { "keywords" : query_string}
    }).then(function onSuccess(response){

      var end = performance.now();
      $scope.request_time = end - start;
      console.log($scope.request_time);


      // JSON object
      var data = response.data
      $scope.return_results(data);

      // Go to results page
      $location.path('/results')


      if ($scope.search_results.length !== 0){
        $scope.no_results = false;
      }
      else {
        $scope.no_results = true;
      }

    }, function onError(error) {
      console.log(error)
    });
  }


  // Function to place search results in search_results array
  $scope.return_results = function(data) {
    // Empty search_results in case there are results from prev searches
    $scope.search_results = []
    $scope.page_number = 0;

    for (var i = 0; i < data.length; i++) {
      $scope.search_results.push(data[i])
    }
  }

  $scope.next_page = function() {
    if ($scope.page_number < $scope.search_results.length - 1)
      $scope.page_number += 1
  }

  $scope.prev_page = function() {
    if ($scope.page_number > 0)
      $scope.page_number -= 1
  }

  $scope.go_to_page = function(index) {
    $scope.page_number = index;
  }

  $scope.switch_tabs = function(link) {
    $location.path(link);
  }

  $scope.display_history = function() {
    $scope.switch_tabs('/history');

    $http({
      method: "POST",
      url: "/gethistory",
      data: {"username" : $scope.user_name }
    }).then(function onSuccess(response) {
      var data = response.data
      $scope.most_popular = data[0];
      $scope.history = data[1];
    })
  }

  $scope.display_images = function() {
    $scope.switch_tabs('/images');

    $http({
      method: "POST",
      url: "/getimages",
      data: { "search_results" : $scope.search_results }
    }).then(function onSuccess(response) {
      var data = response.data
      console.log(data)
      $scope.results_images = data;
      $scope.unfocus();
    })
  }

  $scope.focus_img = function(img_index) {
    if (img_index === $scope.focused_img_index){
      $scope.img_chosen = !$scope.img_chosen;
    }
    else {
      $scope.focused_img_index = img_index
      $scope.focused_img_url = $scope.results_images[img_index]
      $scope.img_chosen = true;
      $window.scrollTo(0,0);
    }
  }

  $scope.unfocus = function() {
    $scope.img_chosen = false;
    $scope.focused_img_index = -1;
  }

  $scope.next_img = function() {
    num_images = $scope.results_images.length
    if ($scope.focused_img_index < num_images - 1) {
      $scope.focused_img_index += 1;
      $scope.focused_img_url = $scope.results_images[$scope.focused_img_index]
    }
  }

  $scope.prev_img = function() {
    num_images = $scope.results_images.length
    if ($scope.focused_img_index > 0) {
      $scope.focused_img_index -= 1;
      $scope.focused_img_url = $scope.results_images[$scope.focused_img_index]
    }
  }

  $scope.display_widgets = function(){
    $scope.switch_tabs('/widgets')
    get_news();
    get_weather();
  }

  function get_news() {
    $http({
      method: "POST",
      url: "/getnews"
    }).then(function onSuccess(response) {
      var data = response.data
      $scope.news_articles = data;

      angular.forEach($scope.news_articles, function(article){
        var date = new Date(article.date)
        new_date = convert_date(date);
        article.date = new_date
      })
    })
  }

  function get_weather() {
    $http({
      method: "POST",
      url: "/getweather"
    }).then(function onSuccess(response){
      var data = response.data;
      $scope.forecast = data;
    })
  }

  function convert_date(d) {
    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    var dt = d.getDate();
    var new_date = ''

    if (dt < 10){
      dt = '0' + dt
    }
    if (month < 10) {
      month = '0' + month
    }

    new_date = year +'-'+ month +'-' + dt;
    console.log(new_date);
    return new_date
  }

  $scope.login = function() {
    console.log($scope.signed_in)
    if (!$scope.signed_in){
      $scope.login_submit = "Login";
      $scope.login_display = true;
      $scope.no_account = true;
    }
  }

  $scope.signup = function() {
    $scope.no_account = false;
    $scope.login_success = true;
    $scope.login_submit = "Sign up";
  }

  $scope.signout = function() {
    $scope.signed_in = false;
  }

  $scope.close_login = function() {
    $scope.login_display = false;
    $scope.login_success = true;
  }


  // Get length of an arbitrary object
  function length(obj) {
    return Object.keys(obj).length;
  }

});
