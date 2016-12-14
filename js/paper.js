/**
 * Created by asus on 2016/9/28.
 * 试卷模块
 */
angular.module("app.paperModule",["ng","app.subjectModule"])  //调用模块app.subjectModule，模块里面的什么服务、指令、控制器等都可以用
    .controller("paperAddController",["$scope","commentService","paperModel","$routeParams","paperService",function ($scope,commentService,paperModel,$routeParams,paperService) {
        //手工组卷即添加试卷
        //手工试卷里面的“所属方向”
        //将查询到的所有方向数据绑定到作用域中
        commentService.getAllDepartment(function (data) {  //获取所有的方向
            $scope.departments=data;
        });
        //双向绑定对象
        $scope.model=paperModel.model;

        //console.log($routeParams);
        var id=$routeParams.id;
        if(id!=0){
            paperModel.addSubjectId(id);

            paperModel.addSubject(angular.copy($routeParams));
        }
        
        //保存
        $scope.savePaper=function () {
            paperService.savePaper($scope.model,function (data) {
                alert(data);
            })
        };

    }])
        //4、手工组卷中点击添加题目按钮，跳转后又按“加入试卷”按钮跳回来。把$routeParams放到上面的控制器中，就不用再写下面这个了
    //要拿参数的话就要注入$routeParams
    // .controller("paperAddSubjectController",["$scope","$routeParams",function ($scope,$routeParams) {
    //     $scope.model=paperModule.model;
    //     console.log($routeParams);
    //     alert(1);
    // }])
    .controller("paperListController",["$scope",function ($scope) {
        //试卷列表
    }])
    .factory("paperService",["$http","$httpParamsSerializer"],function ($http,$httpParamsSerializer) {
        //手工组卷中的“保存”按钮
        return{
            savePaper:function (model,handler) {
                var obj={};
                for(var key in model){
                    var val=model[key];
                    switch(key){
                        case "dId":
                            obj['paper.department.id']=val;
                            break;
                        case "title":
                            obj['paper.title']=val;
                            break;
                        case "desc":
                            obj['paper.description']=val;
                            break;
                        case "tt":
                            obj['paper.totalPoints']=val;
                            break;
                        case "at":
                            obj['paper.answerQuestionTime']=val;
                            break;
                        case "scores":
                            obj['scores']=val;
                            break;
                        case "subjectIds":
                            obj['subjectIds']=val;
                            break;
                    }
                }
                //表单格式序列化即属性名与属性值之间以&来连接
                obj=$httpParamsSerializer(obj);
                $http.post("http://172.16.0.5:7777/test/exam/manager/saveExamPaper.action",
                    obj,{
                        //当使用POST方式提交这种顺序的表单时，
                        // 必须设置“Content-Type”请求头为"application/x-www-form-urlencoded"
                        headers:{
                            "Content-Type":"application/x-www-form-urlencoded"
                        }
                    }).success(function (data) {  //obj作为参数传递
                    handler(data);
                });
            }
        }
    })
    .factory("paperModel",function () {
        return{
            model:{
                dId:1,
                title:"",
                desc:"",
                tt:"",       //总分
                at:"",       //答题时间
                scores:[],          //每个题目对应的分数
                subjectIds:[],     //题目序号、id传过去
                subjects:[]
            },
            addSubjectId:function (id) {    //方法addSubject添加题目。往paperModule里面添加id
                this.model.subjectIds.push(id);
            },
            addSubject:function (subject) {    //方法addSubject添加题目。往paperModule里面添加id
                this.model.subjects.push(subject);
            },
            addScore:function (index,score) {
                this.model.scores[index]=score;
            }
        }
    });


