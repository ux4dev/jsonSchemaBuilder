
function isPlainObject(obj) {
    return obj ? typeof obj === 'object' && Object.getPrototypeOf(obj) === Object.prototype : false;
}

const supportType = ['string', 'number', 'array', 'object', 'boolean', 'integer'];

function getType(type) {
    if (!type) type = 'string';
    if (supportType.indexOf(type) !== -1) {
        return type;
    }
    return typeof type;
}

function isSchema(object) {
    if (supportType.indexOf(object.type) !== -1) {
        return true;
    }
    return false;
}

function handleSchema(json, schema) {
    Object.assign(schema, json);
    if (schema.type === 'object') {
        delete schema.properties;
        parse(null, json.properties, schema);
    }
    if (schema.type === 'array') {
        delete schema.items;
        schema.items = {};
        parse(null, json.items, schema.items)
    }

}

function handleArray(name, arr, schema, opts) {
    schema.type = 'array';
    if (opts.title) schema.title = name || "";
    if (opts.description) schema.description = "";
    var props = schema.items = {};
    parse("", arr[0], props, opts)
}

function handleObject(name, json, schema, opts) {
    if (isSchema(json)) {
        return handleSchema(json, schema)
    }
    schema.type = 'object';
    if (opts.title) schema.title = name || "";
    if (opts.description) schema.description = "";
    schema.required = [];
    var props = schema.properties = {};
    for (var key in json) {
        var item = json[key];
        var curSchema = props[key] = {};
        if (key[0] === '*') {
            delete props[key];
            key = key.substr(1);
            schema.required.push(key);
            curSchema = props[key] = {};

        }
        parse(key, item, curSchema, opts)
    }
}

function parse(name, json, schema, opts) {
    if (Array.isArray(json)) {
        handleArray(name, json, schema, opts)
    } else if (isPlainObject(json)) {
        handleObject(name, json, schema, opts)
    } else {
        schema.type = getType(json)
        if (opts.title) schema.title = name || "";
        if (opts.description) schema.description = "";
    }
}

function jsonSchemaBuilder(data, opts = { description: false, title: false }) {
    var JsonSchema = {};
    JsonSchema["$schema"] = "http://json-schema.org/draft-07/schema#"
    parse(null, data, JsonSchema, opts);
    return JsonSchema;
}


module.exports = jsonSchemaBuilder;