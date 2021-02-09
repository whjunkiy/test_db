<?php
require_once "Controller.php";
Class Core {

    public static function handle($q = []) {
        if (empty($q['act'])) {
            return self::error("No action in request!");
        } else {
            return self::doSomething($q);
        }
    }

    public static function error($err) {
        return json_encode(["status"=>"error", "data" => $err]);
    }

    public static function response($data) {
        return json_encode(["status"=>"ok", "data" => $data]);
    }

    public static function doSomething($q) {
        $act = $q["act"];
        $controller = new ReflectionClass("Controller");
        if (!$controller->hasMethod($act)) {
            return self::error("Unknown option");
        }
        $controller = $controller->newInstance();
        $data = $controller->$act($q);
        if (!empty($data['err'])) {
            return self::error($data['err']);
        }
        return self::response($data);
    }
}
