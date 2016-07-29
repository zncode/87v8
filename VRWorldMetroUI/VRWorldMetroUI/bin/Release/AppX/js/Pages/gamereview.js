Vercoop.PAGE.GameReview = new function () {
    var categorys = null;
    var categoryId = null;
    var game = null;
    var games = null;
    var gameId = null;
    var pageDetail = 0;
    var m_selectedCAIdx = 0;

    this.initialize = function () {
        document.getElementById("page_gamereview_category_wrapper").style.display = 'block';
        document.getElementById("page_gamereview_content_wrapper").style.display = 'block';
        document.getElementById("page_gamereview_detail_wrapper").style.display = 'none';
        document.getElementById("logo_text").innerHTML = '87870.com';
        document.getElementById("img_main_logo").src = '/images/icons_header/logo_256x256.png';
        m_selectedCAIdx = 0;

        this.getCetgorys(function () {
            Vercoop.PAGE.GameReview.categoryHtml();
        });

        this.getGameList(function () {          
            Vercoop.PAGE.GameReview.gamesHtml();
        });
               
    }

    this.getCetgorys = function (fc_callback) {
        Vercoop.API.CommonAPI.gameCategorys(function (categoryData) {
            categorys = categoryData;
            fc_callback();
        });
    }

    this.getGameList = function (fc_callback) {
        Vercoop.API.CommonAPI.gameList(function (gamesData) {
            games = gamesData;
            fc_callback();
        });
    }

    this.getGamesByCid = function (cid) {
        var gameGid = new Array();

        if (cid) {
            for (var i in games) {
                if (cid == games[i].category) {
                    gameGid[i] = games[i];
                }
            }
        }
        else {
            gameGid = games;
        }


        return gameGid;
    }

    this.getGame = function (gid) {

        for (var i in games) {
            if (gid == games[i].ct_idx) {
                game = games[i];
            }
        }

        return game;
    }

    this.categoryHtml = function () {
        Vercoop.API.Category.load(function () {
            reloadCategories();
        });

    }

    this.gamesHtml = function () {
        var gameCategorys = this.getGamesByCid(m_selectedCAIdx);
        var gamesHtml = null;
        gamesHtml = '<ul id="page_gamereview_content_ul">';

        if (gameCategorys)
        {
            for (var i in gameCategorys) {
                gamesHtml += '<li><a href="#" data-game-id="' + gameCategorys[i].ct_idx + '" ><img width="500" height="200" src="' + gameCategorys[i].thumb + '" /></a><div id="page_gamereview_game_title">' + gameCategorys[i].title + '</div></li>';
            }
        }
        else {
            gamesHtml += '<li>没有游戏！</li>';
        }

        gamesHtml += '</ul>';

        document.getElementById("page_gamereview_content_content").innerHTML = gamesHtml;

        //click
        var a = document.getElementById("page_gamereview_content_ul").getElementsByTagName("a");
        for (var i = 0; i < a.length; i++) {
            a[i].onclick = function () {
                var gid = this.attributes["data-game-id"].value;
                Vercoop.PAGE.GameReview.gameHtml(gid);
                pageDetail = 1;
               // Vercoop.PAGE.GameReview.changeTitle();
               // document.getElementById("page_gamereview_category_wrapper").style.display = 'none';
            }
        }
    }

    this.gameHtml = function (gid) {
        game = this.getGame(gid);
        var gameHtml = '';
        
       // gameHtml += '<div id="page_gamereview_content_detail_title"><div><img id="img_back" width="48" height="48" src="/images/icons_header/back_48x48.png" style="cursor:pointer; margin-top: 0px; display:block;" /><div><div>' + game.title + '<div></div>';
        gameHtml += '<div id="page_gamereview_content_detail_wrapper">';
            gameHtml += '<div id="page_gamereview_content_detail_left"><img src="' + game.cover_image + '" width="1250px" /><div id="page_gamereview_content_game_title">' + game.title + '</div></div>';
            gameHtml += '<div id="page_gamereview_content_detail_right">';
                gameHtml += '<div id="page_gamereview_content_detail_right_title">游戏介绍</div>';
                gameHtml += '<div id="page_gamereview_content_detail_right_description">' + game.description + '</div>';
            gameHtml += '</div>';
        gameHtml += '</div>';
        
        //document.getElementById("page_gamereview_content_content").innerHTML = gameHtml
        document.getElementById("page_gamereview_category_wrapper").style.display = 'none';
        document.getElementById("page_gamereview_content_wrapper").style.display = 'none';
        document.getElementById("page_gamereview_detail_wrapper").style.display = 'block';

        document.getElementById("page_gamereview_detail_wrapper").innerHTML = gameHtml;
        document.getElementById("img_main_logo").src = '/images/icons_header/back_48x48.png';
        document.getElementById("logo_text").innerHTML = game.title;

        //click
    }

    this.changeTitle = function () {
        var title;
        if (pageDetail == 1) {
            title = '游戏介绍';
        }
        else {
            title = '游戏列表';
        }

        document.getElementById("page_gamereview_content_title").innerHTML = title;
    }

    function setCurrentCategory(ca_idx) {
        //change page title
        pageDetail = 0;
        Vercoop.PAGE.GameReview.changeTitle();

        for (var i = 0; i < m_CADivs.length; i++) {
            var element = m_CADivs[i];
            if (ca_idx == 0) {
                ca_idx = element.Category.ca_idx;
            }

            if (element.Category.idx == ca_idx) {
                element.MainDIV.style.backgroundColor = "#ed1c24";
                element.ThumbImage.src = "/images/category/ca_hot_20x20.png";
            } else {
                if (i == m_CADivs.length - 1) {
                    element.MainDIV.style.backgroundColor = "#1bb7d5";
                    element.ThumbImage.src = "/images/category/ca_all_20x20.png";
                } else if (i == m_CADivs.length - 2) {
                    element.MainDIV.style.backgroundColor = "#8dc63f";
                    element.ThumbImage.src = "/images/category/ca_all_20x20.png";
                } else {

                    element.MainDIV.style.backgroundColor = "#202020";
                    element.ThumbImage.src = "/images/category/ca_normal_20x20.png";
                }
            }
        }

        m_selectedCAIdx = ca_idx;

        Vercoop.PAGE.GameReview.gamesHtml();
    }
    function CAElement() {
        this.MainDIV = null;
        this.Category = null;
        this.ThumbImage = null;
    }
    
    function reloadCategories() {
        var padding = 20;

        m_CADivs = [];
        var mainDiv = document.getElementById("page_gamereview_category_menu");
        Vercoop.Utils.UIDecorator.CleanDIV(mainDiv);
        for(var i in categorys) {
           
            var element = createCAMainDiv(categorys[i]);
            if (i > 0) {
                element.MainDIV.style.marginTop = padding + "px";
            }
            mainDiv.appendChild(element.MainDIV);
            m_CADivs.push(element);
        }
        var allInfo = new Vercoop.API.Category.CreateCAInfo("ALL", gv_CA_ALL_INDEX);
        var element = createCAMainDiv(allInfo);
        element.MainDIV.style.marginTop = padding + "px";
        mainDiv.appendChild(element.MainDIV);
        m_CADivs.push(element);

        setCurrentCategory(m_selectedCAIdx);
        function createCAMainDiv(caInfo) {
            var mainDiv = document.createElement("div");
            var thumbDiv = document.createElement("div");
            var thumbImage = document.createElement("img");
            var lblSpan = document.createElement("span");


            mainDiv.className = "item-category";
            thumbDiv.className = "emphasize-area";
            lblSpan.className = "label";
            mainDiv.appendChild(thumbDiv);
            thumbDiv.appendChild(thumbImage);
            mainDiv.appendChild(lblSpan);


            lblSpan.innerText = caInfo.name;

            var element = new CAElement();
            element.MainDIV = mainDiv;
            element.Category = caInfo;
            element.ThumbImage = thumbImage;

            Vercoop.Utils.Utility.NormalMouseUp(mainDiv,
                function () {
                    setCurrentCategory(caInfo.idx);
                }
           );

            return element;

        }
    }
}