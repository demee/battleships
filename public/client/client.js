$(function () {
    console.log("Battleship Client");

    var CLIENT = {
        token: $.cookie('token'),
        serverUrl: "http://battleships/",
        body: $(".body"),
        header: $(".header"),
        name: 'Player',
        currentGame: "",
        currentGameId: "",
        serverUrlWithToken: function () {
            return this.serverUrl + this.token + "/";
        },
        createGame: function () {
            var that = this;
            console.log("create game");
            $.getJSON(that.serverUrlWithToken() + "game/new?callback=?", function (response) {
                console.log("success");
                console.log("response=" + response);

                if (typeof response.error !== 'undefined') {
                    console.error(response.error)
                } else {
                    var msg = "New Game created ID=" + response.id;
                    console.log(msg);
                    alert(msg);
                }
            });
        },
        joinGame: function (gameId) {
            console.log("joining game " + gameId);
            var that = this;
            $.getJSON(that.serverUrlWithToken() + 'game/' + gameId + '/join?callback=?', function (response) {
                that.body.empty().append('<p>' + response.msg + '</p><button class="playGame" value="' + gameId + '">Play</button>');
            });
        },
        listGames: function (url, callback) {
            var that = this;
            $.getJSON(url + "game/list?callback=?", function (response) {
                if (typeof response.error !== 'undefined') {
                    console.error(response.error)
                } else {
                    console.log("List of available games");
                    that.body.empty();
                    $.each(response, function () {
                        var player1 = this.players[0].name;
                        that.body.append($("<div class='game'>").append($('<button>', {value: this.id, text: 'Join'}))
                            .append("<p>Created by: " + player1 + "</p><p>Game Id= " + this.id + "</p><p>" + this.created_at + "</p>"));
                    });
                }
                if (typeof callback !== 'undefined') {
                    callback();
                }
            });
        },
        listOpenGames: function () {
            this.listGames(this.serverUrlWithToken());
        },
        listAllGames: function () {
            var that = this;
            this.listGames(this.serverUrl, function () {
                that.body.find("button").remove();
            });
        },
        logIn: function () {
            this.token = prompt("Please enter your token", "-orsGMSc789m-Jk_97jivA");
            $.cookie('token', this.token);
            this.updateLoginUi();
        },
        updateLoginUi: function () {
            var that = this;
            $.getJSON(this.serverUrlWithToken() + "mystats?callback=?", function (response) {
                if (response.error) {
                    alert("Unable to Sign In: " + response.error);
                    that.header.find("#menuLogIn").text("Sign In");
                    return
                }
                that.name = response.name;
                that.header.find("#menuLogIn").text("Sign out " + that.name);
            });
        },
        bindEvents: function () {
            var that = this;
            $("#menuCreateGame").click(function () {
                that.createGame();
            });
            $("#menuListOpenGames").click(function () {
                that.listOpenGames();
            });
            $("#menuListAllGames").click(function () {
                that.listAllGames();
            });
            $("#menuLogIn").click(function () {
                that.logIn();
            });
            this.body.on('click', '.game button', function () {
                that.joinGame(this.value);
            });
            this.body.on('click', 'button.showMyGame', function () {
                var url = that.serverUrlWithToken() + "/game/" + this.value + "/show";
                window.open(url, '_blank');
            });
            this.body.on('click', 'button.playGame', function () {
                that.currentGameId = this.value;
                that.playGame();
            });
        },
        updateActiveGameStatus: function (callback) {
            var that = this;
            $.getJSON(this.serverUrlWithToken() + "game/" + that.currentGameId + "/?callback=?", function (response) {
                if (response.error) {
                    alert("Unable to update info about the active game" + response.error);
                } else {
                    that.currentGame = response;
                    that.body.append("<p>" + JSON.stringify(response) + "</p>");
                    callback();
                }
            });
        },
        setShips: function (callback) {
            var that = this;
            // SET SHIPS RANDOMLY
            $.getJSON(this.serverUrlWithToken() + "game/" + that.currentGameId + "/randomize?callback=?", function (response) {
                if (response.error) {
                    alert("Unable to update info about the active game" + response.error);
                } else {
                    that.currentGame = response;
                    that.body.append("<p>" + JSON.stringify(response) + "</p>");
                    that.body.append("<button class='showMyGame' value='" + that.currentGameId + "'>SHOW MY BOARD</button>");
                    callback();
                }
            });
        },
        playGame: function () {
            var that = this;
            that.body.empty();
            that.updateActiveGameStatus(function () {
                that.setShips(function () {
                    that.startShooting();
                });
            });
        },
        startShooting: function () {
            // TODO: implement your algorithm here
            this.body.append("<p>" + "Shooting to board " + JSON.stringify(this.currentGame) + "</p>")
        },
        init: function () {
            this.bindEvents();
            this.updateLoginUi();
        }
    };
    CLIENT.init();
});
