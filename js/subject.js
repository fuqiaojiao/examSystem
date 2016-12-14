/**
 * Created by asus on 2016/9/22.
 * 题库模块
 */

angular.module("app.subjectModule",["ng"])
    //控制器
    //获取路由里面的参数用$routeParams，页面跳转用$location
    .controller("subjectDelController",["$routeParams","$location","subjectService",function ($routeParams,$location,subjectService) {
        //2、删除题目
        //alert("删除");
        //询问
        var flag=confirm("确认删除吗？");
        if(flag){       //如果已经点击了
            //删除
            //获取id去删除  删除要与后台交互，涉及到后台交互就要想到ajax，ajax要写到service里面
            subjectService.delSubject($routeParams.id,function (data) {
                alert(data);    //data为返回的值
            });
        }
        //跳转
        $location.path("/SubjectList/dpId/0/topicId/0/levelId/0/typeId/0");
    }])
    .controller("subjectCheckController",["$routeParams","$location","subjectService",function ($routeParams,$location,subjectService) {
        //3、审核
            subjectService.checkSubject($routeParams.id,$routeParams.state,function (data) {
                alert(data);    //data为返回的值
            });
        //跳转
        $location.path("/SubjectList/dpId/0/topicId/0/levelId/0/typeId/0");
    }])
    .controller("subjectController",["$scope","commentService","subjectService","$filter","$routeParams","$location",function ($scope,commentService,subjectService,$filter,$routeParams,$location) {
        //调用服务方法，加载题目属性信息，并且进行绑定
            //console.log($routeParams);
        $scope.params=$routeParams;
        $scope.isShow=true;  //默认点击 显示答案和解析

        //封装筛选模板对象
        //<!--将题型、方向、知识点和难度中的属性进行筛选-->。匿名函数的调用
        var subjectModule=(function () {
            var obj={};
            //console.log(!!0)  //false。!!0即将0转换为布尔类型
            if($routeParams.typeId!=0){  //typeId为0的话，为false
                //如果typeId为0的话，下面的这个代码不会执行，那obj={}就为空
                //obj[''] 代表一个属性，为中括号添加一个属性名为subject.subjectType.id
                obj['subject.subjectType.id']=$routeParams.typeId;
            }
            if($routeParams.dpId!=0){
                obj['subject.department.id']=$routeParams.dpId;
            }
            if($routeParams.topicId!=0){
                obj['subject.topic.id']=$routeParams.topicId;
            }
            if($routeParams.levelId!=0){
                obj['subject.subjectLevel.id']=$routeParams.levelId;
            }
            console.log("参数对象：",obj);
            return obj;
        })();

        //添加页面中的默认数据
        $scope.model = {
            typeId:1,   //typeId等于3时，默认为简答题
            levelId:1,
            departmentId:1,
            topicId:1,
            stem:"",   //题干
            answer:"",
            analysis:"",
            choiceContent:[],  //选项的内容
            choiceCorrect:[false,false,false,false]   //正确选项

        };
        //点击了“保存并继续”时
        $scope.add=function () {
            //调用service方法，完成题目的保存即把参数model给方法saveSubject，再回调保存
            //参数model为要保存的数据，将其传过来
            subjectService.saveSubject($scope.model,function (data) {
                alert(data);
            });
            //调用完之后才重置
            var model = {       //这个对象(model)跟上面的那个不一样，上面的那个会变，这个不会变
                typeId:1,
                levelId:1,
                departmentId:1,
                topicId:1,
                stem:"",
                answer:"",
                analysis:"",
                choiceContent:[],
                choiceCorrect:[false,false,false,false]

            };
            //重置$scope，即重置表单。点击"保存并继续"了的时候页面进行刷新，没有数据
            //把一个对象拷贝到另一个对象里面 angular.copy(source,[destination]);就是把source拷贝到destination里面
            angular.copy(model,$scope.model);
        };
        //点击了“保存并关闭”时
        $scope.addAndClose=function () {
            subjectService.saveSubject($scope.model, function (data) {
                alert(data);
                //跳转到列表页面
                $location.path("/SubjectList/dpId/0/topicId/0/levelId/0/typeId/0");
            });
        };

        //服务调用
        commentService.getAllType(function (data) {
            $scope.types=data;
            //console.log(data);
        });
        commentService.getAllDepartment(function (data) {
            $scope.departments=data;
        });
        commentService.getAllTopics(function (data) {
            $scope.topics=data;
        });
        commentService.getAllLevel(function (data) {
            $scope.levels=data;
        });
        //调用subjectService获取所有题目信息
        subjectService.getAllSubjects(subjectModule,function (data) {
            //遍历所有题目，计算出选择题的答案，并且将答案赋给subject
            data.forEach(function (subject) {  //这里的subject是题目，不是参数
                //这里id=3的话是简答题
                if(subject.subjectType&&subject.subjectType.id!=3){
                    //空数组里面存答案
                    var answer=[];
                    //算答案，遍历选项
                    subject.choices.forEach(function (choice,index) {
                        if(choice.correct){
                            //注入过滤器并调用过滤器的转换方法，将索引index转换为A/B/C/D
                            var no=$filter('indexToNo')(index);
                            answer.push(no);
                        }
                    });
                    //并将计算出来的正确答案赋给subject.answer。answer.toString()将数组answer转换为字符串
                    subject.answer=answer.toString();
                }
            });
            $scope.subjects=data;
        });

    }])
        //设计到后台交互、http要到服务里面去写
    //题目（题干）服务，封装操作题目的函数
    .service("subjectService",["$http","$httpParamSerializer",function ($http,$httpParamSerializer) {
        //3、审核
        //id是要更改谁的，state是要把它的状态改成什么样的，handler是更改完后做的事
        this.checkSubject=function (id,state,handler) {
            $http.get("http://172.16.0.5:7777/test/exam/manager/checkSubject.action",{
                params:{                  //是get方式传输，所以用到params
                    'subject.id':id,      //把上面的参数id传过来
                    'subject.checkState':state
                }
            }).success(function (data) {
                handler(data);
            })
        };
        //2、删除题目
        //id代表要删除的编号，handler代表删除后要做的事
        this.delSubject=function (id,handler) {
            $http.get("http://172.16.0.5:7777/test/exam/manager/delSubject.action",{
                params:{       //是get方式传输，所以用到params
                    'subject.id':id    //把上面的参数id传过来
                }
            }).success(function (data) {
                handler(data);
            })
        };
        this.getAllSubjects=function (params,handler) {
            /*
            $http.get("http://172.16.0.5:7777/test/exam/manager/getAllSubjects.action",{
                params:params
            }).success(function (data) {
             */

            $http.get("data/subjects.json",{
                params:params
            }).success(function (data) {

                handler(data);
            });
        };

        //单个添加题目页面中的添加题目
        //把参数给params，把回调函数给handler
        this.saveSubject=function (params,handler) {
            //将参数转换为angular需要的数据格式
            var obj={};
            //拿到所有的值
            for(var key in params){
                var val=params[key];  //拿到val值
                //console.log(val);  //topicId:1 ....
                switch(key){
                    case "typeId":
                        obj['subject.subjectType.id']=val;  //给obj动态添加一个参数subject.subjectType.id
                        break;
                    case "levelId":
                        obj['subject.subjectLevel.id']=val;
                        break;
                    case "departmentId":
                        obj['subject.department.id']=val;
                        break;
                    case "topicId":
                        obj['subject.topic.id']=val;
                        break;
                    case "stem":
                        obj['subject.stem']=val;
                        break;
                    case "answer":
                        obj['subject.answer']=val;
                        break;
                    case "analysis":
                        obj['subject.analysis']=val;
                        break;
                    case "choiceContent":
                        obj['choiceContent']=val;
                        break;
                    case "choiceCorrect":
                        obj['choiceCorrect']=val;
                        break;
                }
            }
            //console.log(obj);  //obj为提交到后台的数据
            //将对象数据转换为表单编码样式的数据
            obj=$httpParamSerializer(obj);  //对数据进行编码。把转换好的obj附给前面的obj

            //传给后台 。post的第一个参数为url,第二个参数为要传递的数据，第三个参数为配置对象
            $http.post("http://172.16.0.5:7777/test/exam/manager/saveSubject.action",
                obj,{
                //当使用POST方式提交这种顺序的表单时，
                    // 必须设置“Content-Type”请求头为"application/x-www-form-urlencoded"
                    headers:{
                        "Content-Type":"application/x-www-form-urlencoded"
                    }
                }).success(function (data) {  //obj作为参数传递
                handler(data);
            });

        };
    }])
    //公共服务 用于获取题目相关信息
    .factory("commentService",["$http",function ($http) {
        return{
            getAllType:function (handler) {
                // $http.get("http://172.16.0.5:7777/test/exam/manager/getAllSubjectType.action").success(function (data) {
                $http.get("data/type.json").success(function (data) {
                    handler(data);
                });
            },
            getAllDepartment:function (handler) {
                //$http.get("http://172.16.0.5:7777/test/exam/manager/getAllSubjectDepartment.action").success(function (data) {
                $http.get("data/department.json").success(function (data) {
                    handler(data);
                });
            },
            getAllTopics:function (handler) {
                // $http.get("http://172.16.0.5:7777/test/exam/manager/getAllTopics.action").success(function (data) {
                $http.get("data/topics.json").success(function (data) {
                    handler(data);
                });
            },
            getAllLevel:function (handler) {
                // $http.get("http://172.16.0.5:7777/test/exam/manager/getAllSubjectLevel.action").success(function (data) {
                $http.get("data/level.json").success(function (data) {
                    handler(data);
                })
            }
        }
    }])
    //过滤器，过滤添加题目中的topics
    .filter("selectTopics",function () {
        //第一个参数input代表要过滤的内容即（|）前面的内容。第二个参数为冒号（:）后面的第一个参数即subjectAdd.html中model.departmentId
        //input为topic数组   id为部门id
        return function (input,id) {   //返回过滤的内容
            //console.log(input,id);
            if(input){  //当input存在时
                //通过array中的过滤器函数过滤满足条件的topic
                var arr=input.filter(function (item) {
                    //item为数组里面每一个topic对象
                    return item.department.id==id; //topic部门中的id等于这里的参数id时就返回
                });
                return arr;
            }
        }
    })
    //加过滤器，把1,2,3。。变成A,B,C。。
    .filter("indexToNo",function () {
        return function (input) {
            //return input==0?'A':(input==1>'B':)
            //alert(typeof input);  //为number类型
            var result;
            switch(input){
                case 0:
                    result='A';
                    break;
                case 1:
                    result='B';
                    break;
                case 2:
                    result='C';
                    break;
                case 3:
                    result='D';
                    break;
                case 4:
                    result='E';
                    break;
                case 5:
                    result='F';
                    break;
                case 6:
                    result='G';
                    break;
            }
            return result;
        }
    })
        //对单选题、多选题、进行绑定，
    //如果涉及到对DOM的操作（即复制节点、作事件的绑定）就用指令directive
    //指令就是视图，有三个阶段：1.编译阶段，对模板就行操作。2.控制阶段，对作用域进行操作。3.链接阶段，对DOM的操作
    .directive("selectOption",function () {
        return{
            restrict:"A",
            // compile:function () {  //compile返回值是一个链接函数。有compile了就不能有link
            //     return    //返回一个链接
            // }
            //链接就是把作用域中的值绑定到元素中
            link:function (scope,element) {   //这里只需要链接
                //console.log(element);  //jQuery
                //console.log(scope); //作用域
                element.on("change",function () {
                    var type=element.attr("type");
                    var isCheck=element.prop("checked");
                         //alert(type);
                    if(type=="radio"){
                        scope.model.choiceCorrect=[false,false,false,false];
                              //alert(angular.element(this).val());    //angular.element实际上等于$。this为当前绑定的元素，this为普通的DOM所以要封装
                        var index=angular.element(this).val();
                              //console.log(scope.model.choiceCorrect);
                        scope.model.choiceCorrect[index]=true;
                              //console.log(scope.model.choiceCorrect);
                        //强制将scope更新
                        scope.$digest();
                    }else if(type=="checkbox" && isCheck){
                        var index=angular.element(this).val();
                              alert(index+","+isCheck);
                        scope.model.choiceCorrect[index]=true;
                    }
                    //强制将scope更新
                    scope.$digest();
                });
            }
        }
    });














































