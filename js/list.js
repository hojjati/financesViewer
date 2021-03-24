var app = angular.module('finances', []);
/*
* Contoller gets list of all tranactions from API
* */
app.controller('transactionsCtrl', function ($scope, $http) {
    $scope.dateFormat = 'dd MMM, yyyy';
    $scope.allTransactions = [];
    $scope.pagesCount = 0;
    $scope.sum = 0;

    /*
    * Sets value of css class for debit vs. credit transactions
    * */
    $scope.getMonetaryClass = function (value) {
        return (value > 0 ? 'credit' : 'debit');
    }

    /*
    * Loads first page from API
    * */
    const loadFirstPage = function () {
        return $http.get("https://resttest.bench.co/transactions/1.json");
    }

    /*
    * This function processes the contents of first page and pushes into allTransactions array 
    * and calculates pagesCount
    * */
    const processFirstPage = function (response) {
        $scope.totalCount = response.data['totalCount'];
        for (transaction of response.data.transactions) {
            $scope.allTransactions.push(transaction);
        }
        $scope.countPerPege = $scope.allTransactions.length;
        $scope.pagesCount = Math.ceil($scope.totalCount / $scope.countPerPege);
    }

    /*
    * Loads pages [1-pagesCount] from API
    * */
    const loadNextPages = function () {
        const promises = [];
        if ($scope.pagesCount > 1) {
            for (let i = 2; i <= $scope.pagesCount; i++) {
                promises.push($http.get(`https://resttest.bench.co/transactions/${i}.json`));
            }
        }
        return Promise.all(promises);
    }

    /*
    * Processes te contents of remaining pages and pushes data into allTransactions
    * */
    const processNextPages = function (responses) {
        for (response of responses) {
            for (transaction of response.data.transactions) {
                $scope.allTransactions.push(transaction);
            }
        }
    }

    /*
    * Calculates the sum of all transactions (to be displayed in the header)
    * */
    const calculateSum = function () {
        for (transaction of $scope.allTransactions) {
            $scope.sum += parseFloat(transaction.Amount);
        }
    }

    /*
    * Handles any error that might arise communucating with the server
    * */
    const onError = function (response) {
        $scope.errorMsg = response.data;
    }

    loadFirstPage()
        .then((response) => processFirstPage(response))
        .then(() => loadNextPages())
        .then((responses) => processNextPages(responses))
        .then(() => calculateSum())
        .catch((response) => onError(response));

});

/*
* Filter for making numbers positive in the template
* */
app.filter('makePositive', function () {
    return function (num) { return Math.abs(num); }
});
