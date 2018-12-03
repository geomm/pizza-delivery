define({ "api": [
  {
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "varname1",
            "description": "<p>No type.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "varname2",
            "description": "<p>With type.</p>"
          }
        ]
      }
    },
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "./docs/main.js",
    "group": "C__Users_neutraltoe_apps_exercises_js_pirple_assignments_pizza_delivery_docs_main_js",
    "groupTitle": "C__Users_neutraltoe_apps_exercises_js_pirple_assignments_pizza_delivery_docs_main_js",
    "name": ""
  },
  {
    "type": "get",
    "url": "/tokens/",
    "title": "Get Token",
    "group": "Tokens",
    "version": "1.0.0",
    "permission": [
      {
        "name": "none"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "Id",
            "description": "<p>Token id of the user in the querystring ex./tokens/?id=xxxxxxxxxxxxxxxxxxxx .</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "number",
            "optional": false,
            "field": "statusCode",
            "description": "<p>The status code of the request.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Number",
            "optional": false,
            "field": "statusCode",
            "description": "<p>400 - Missing required fields.</p>"
          }
        ]
      }
    },
    "filename": "./lib/handlers.js",
    "groupTitle": "Tokens",
    "name": "GetTokens"
  },
  {
    "type": "post",
    "url": "/tokens/",
    "title": "Create Token",
    "group": "Tokens",
    "name": "Login",
    "version": "1.0.0",
    "permission": [
      {
        "name": "none"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Email of the user in payload.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>Password of the user in payload.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "number",
            "optional": false,
            "field": "statusCode",
            "description": "<p>The status code of the request.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Number",
            "optional": false,
            "field": "statusCode",
            "description": "<p>400 - Missing required fields.</p>"
          }
        ]
      }
    },
    "filename": "./lib/handlers.js",
    "groupTitle": "Tokens"
  },
  {
    "type": "delete",
    "url": "/tokens/",
    "title": "Delete Token",
    "group": "Tokens",
    "name": "Logout",
    "version": "1.0.0",
    "permission": [
      {
        "name": "user"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Token id to extend in the querystring.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "number",
            "optional": false,
            "field": "statusCode",
            "description": "<p>The status code of the request.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Number",
            "optional": false,
            "field": "statusCode",
            "description": "<p>400 - Missing required fields.</p>"
          }
        ]
      }
    },
    "filename": "./lib/handlers.js",
    "groupTitle": "Tokens"
  },
  {
    "type": "put",
    "url": "/tokens/",
    "title": "Update Token",
    "group": "Tokens",
    "version": "1.0.0",
    "permission": [
      {
        "name": "user"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Token id to extend in the payload.</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": false,
            "field": "extend",
            "description": "<p>Extend token in the payload.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "number",
            "optional": false,
            "field": "statusCode",
            "description": "<p>The status code of the request.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Number",
            "optional": false,
            "field": "statusCode",
            "description": "<p>400 - Missing required fields.</p>"
          }
        ]
      }
    },
    "filename": "./lib/handlers.js",
    "groupTitle": "Tokens",
    "name": "PutTokens"
  },
  {
    "type": "verifyToken",
    "url": "//",
    "title": "Verify Token",
    "group": "Tokens",
    "name": "verifyToken",
    "version": "1.0.0",
    "permission": [
      {
        "name": "user"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Token id to verify its existence and expiration.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "true",
            "description": "<p>Token is valid.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Boolean",
            "optional": false,
            "field": "false",
            "description": "<p>Token is invalid or expired.</p>"
          }
        ]
      }
    },
    "filename": "./lib/handlers.js",
    "groupTitle": "Tokens"
  },
  {
    "type": "delete",
    "url": "/users/",
    "title": "Delete User",
    "group": "User",
    "version": "1.0.0",
    "permission": [
      {
        "name": "user"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Email of the user as a query string (/users/?email=example@email.com).</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "number",
            "optional": false,
            "field": "statusCode",
            "description": "<p>The status code of the request.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Number",
            "optional": false,
            "field": "statusCode",
            "description": "<p>400 - Missing required fields (email).</p>"
          }
        ]
      }
    },
    "filename": "./lib/handlers.js",
    "groupTitle": "User",
    "name": "DeleteUsers"
  },
  {
    "type": "get",
    "url": "/users/",
    "title": "Get User",
    "group": "User",
    "version": "1.0.0",
    "permission": [
      {
        "name": "user"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Email of the user as a query string (/users/?email=example@email.com).</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "number",
            "optional": false,
            "field": "statusCode",
            "description": "<p>The status code of the request.</p>"
          },
          {
            "group": "Success 200",
            "type": "object",
            "optional": false,
            "field": "userObj",
            "description": "<p>The requested user's Object.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "userObj.name",
            "description": "<p>The requested user's name.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "userObj.email",
            "description": "<p>The requested user's email.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "userObj.streetAddress",
            "description": "<p>The requested user's street address.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "userObj.tosAgreement",
            "description": "<p>The requested user's terms of service agreement.</p>"
          },
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "userObj.orderHistory",
            "description": "<p>The requested user's history collection.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n    {\n\t\t    \"name\": \"Name Surname\",\n\t\t    \"email\": \"example@email.com\",\n\t\t    \"streetAddress\": \"10th Some Street\",\n\t\t    \"tosAgreement\": true,\n\t\t    \"orderHistory\": [\n\t\t        {\n\t\t            \"XXXXX\": {\n\t\t                \"stripeChargeId\": \"ch_XXXXXXXXXXXXXXXXXXXXXXXX\",\n\t\t                \"mailgunEmailId\": \"<XXXXXXXXXXXXXX.X.XXXXXXXXXXXXXXXX@sandboxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.mailgun.org>\"\n\t\t            }\n\t\t        },\n {\n\t\t            \"YYYYY\": {\n\t\t                \"stripeChargeId\": \"ch_YYYYYYYYYYYYYYYYYYYYYYYY\",\n\t\t                \"mailgunEmailId\": \"<YYYYYYYYYYYYYY.Y.YYYYYYYYYYYYYYYY@sandboxYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY.mailgun.org>\"\n\t\t            }\n\t\t        }\n\t\t    ]\n\t    }",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Number",
            "optional": false,
            "field": "statusCode",
            "description": "<p>400 - Missing request required field (email) or user does not exist.</p>"
          }
        ]
      }
    },
    "filename": "./lib/handlers.js",
    "groupTitle": "User",
    "name": "GetUsers"
  },
  {
    "type": "post",
    "url": "/users/",
    "title": "Create User",
    "group": "User",
    "version": "1.0.0",
    "permission": [
      {
        "name": "none"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Full name of the User.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Email of the User.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "streetAddress",
            "description": "<p>Street address of the User.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>Password of the User.</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": false,
            "field": "tosAgreement",
            "description": "<p>Terms of service agreement acceptance of the User.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "type",
            "description": "<p>of the User. It can be ['Admin', 'User'] but this should not be filled by the user.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "number",
            "optional": false,
            "field": "statusCode",
            "description": "<p>200 - User created.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "number",
            "optional": false,
            "field": "statusCode",
            "description": "<p>400 - Missing required fields.</p>"
          }
        ]
      }
    },
    "filename": "./lib/handlers.js",
    "groupTitle": "User",
    "name": "PostUsers"
  },
  {
    "type": "put",
    "url": "/users/",
    "title": "Update User",
    "group": "User",
    "version": "1.0.0",
    "permission": [
      {
        "name": "user"
      }
    ],
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Email of the user in the payload. It must be defined.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>New name of the user in the payload.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "streetAddress",
            "description": "<p>New address of the user in the payload.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>New email of the user in the payload.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "number",
            "optional": false,
            "field": "statusCode",
            "description": "<p>The status code of the request.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "Number",
            "optional": false,
            "field": "statusCode",
            "description": "<p>400 - Missing required fields (email).</p>"
          }
        ]
      }
    },
    "filename": "./lib/handlers.js",
    "groupTitle": "User",
    "name": "PutUsers"
  }
] });
