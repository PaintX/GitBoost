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
    }
}

module.exports = routes;