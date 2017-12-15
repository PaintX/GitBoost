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
    }
}

module.exports = routes;