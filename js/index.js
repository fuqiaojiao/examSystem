/**
 * Created by asus on 2016/9/22.
 *项目的核心js
 */

// 左侧导航动画

$(function(){
    //收缩全部
    $(".baseUI>li>ul").slideUp("fast");
    $(".baseUI>li>a").off("click");
    $(".baseUI>li>a").on("click",function(){
        $(".baseUI>li>ul").slideUp("fast");
        $(this).next().slideDown();
    });
    //默认让第一个展开
    $(".baseUI>li>a").eq(0).trigger("click");  //模拟点击，默认点击了题库

    //背景改变
    $(".baseUI ul>li").off("click");
    $(".baseUI ul>li").on("click",function () {
        //alert(1);
        if(!$(this).hasClass("current")){
            $(".baseUI ul>li").removeClass("current");
            $(this).addClass("current");
        }
    });
    //模拟点击全部题目
    $(".baseUI ul>li").eq(0).find("a").trigger("click");
});



//项目核心模块
angular.module("app",["ng","ngRoute","app.subjectModule","app.paperModule"])
    .controller("mainController",["$scope",function ($scope) {

    }])
    .config(["$routeProvider",function ($routeProvider) {
        //如：a href="SubjectList/dpId/1/topicId/3/levelId/2/typeId/1"
        //这里的第一个dpId是参数，第二个是常量
        //路由
        $routeProvider.when("/SubjectList/dpId/:dpId/topicId/:topicId/levelId/:levelId/typeId/:typeId",{
            templateUrl:"tpl/subject/subjectList.html",
            controller:"subjectController"
        }).when("/SubjectManager",{
            templateUrl:"tpl/subject/subjectManager.html",
            controller:"subjectController"
        }).when("/SubjectAdd",{     //全部题目中的单个添加操作
            templateUrl:"tpl/subject/subjectAdd.html",
            controller:"subjectController"
        }).when("/SubjectDel/id/:id",{     //删除操作
            templateUrl:"tpl/subject/subjectList.html",
            controller:"subjectDelController"
        }).when("/SubjectCheck/id/:id/state/:state",{       //审核操作
            templateUrl:"tpl/subject/subjectList.html",
            controller:"subjectCheckController"
        }).when("/PaperList",{
            templateUrl:"tpl/paper/paperManager.html",
            controller:"paperListController"
        }).when("/PaperAdd/id/:id/stem/:stem/type/:type/topic/:topic/level/:level",{              //手工组卷中的添加题目
            templateUrl:"tpl/paper/paperAdd.html",
            controller:"paperAddController"
        }).when("/PaperAddSubject",{              //点击手工组卷中的添加题目
            templateUrl:"tpl/paper/subjectList.html",  //跳转到subjectList.html页面
            controller:"subjectController"
        });
    }]);














