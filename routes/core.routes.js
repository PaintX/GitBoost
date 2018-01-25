/*
 * Created on Tue Nov 08 2016
 *
 * Copyright (c) 2016 Sylvain LERIS - Y3S SAS
 */
var routes =
{
    'index': {
        url: '/',
        controller: 'index',
        view: 'index'
    },
    'view' : {
        url : '/view',
        controller : 'TreeController',
        view : 'tree'
    },
    'login': {
        url: '/login',
        controller: 'UserController',
        view: 'login'
    },
    'logout': {
        url: '/logout',
        controller: 'UserController',
        view: 'login'
    },
    'commits' : {
        url : '/commits',
        controller : 'CommitsController',
        view : 'commits_list'
    }
    ,
    'stats' : {
        url : '/stats',
        controller : 'StatsController',
        view : 'stats'
    },
    'network' : {
        url : '/network',
        controller : 'NetworkController',
        view : 'network'
    },
    'create' : {
        url : '/create',
        controller : 'ReposController',
        view : 'create'
    },
    'download' : {
        url : '/download',
        controller : 'DownloadController',
    }
}

module.exports = routes;