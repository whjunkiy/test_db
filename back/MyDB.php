<?php
Class papperDB {
    private static $path = __DIR__ . DIRECTORY_SEPARATOR . "tables";

    public static function execSQL($query) {

        if ($query === "SHOW ALL TABLES") {
            return self::showAllTables();
        } else if (preg_match("/CREATE TABLE ([^|]+) (.+)/uis", $query, $foo)) {
           $fname = trim($foo[1]);
           $cols = substr($foo[2],1,-1) . "\r\n";
           file_put_contents(self::$path. DIRECTORY_SEPARATOR . $fname, $cols);
           return true;
        } else if (preg_match("/SELECT \* FROM (.+)/uis", $query, $foo)) {
            $handle = @fopen(self::$path. DIRECTORY_SEPARATOR . $foo[1], "r");
            $arr = [];
            if ($handle) {
                $i = 0;
                while (($buffer = fgets($handle, 4096)) !== false) {
                    $tmp = explode(",", $buffer);
                    if (!$i) {
                        $cols = $tmp;
                    } else {
                        $arr[] = $tmp;
                    }
                    $i++;
                }
                if (!feof($handle)) {
                    return false;
                }
                fclose($handle);
            } else return false;
            return [$cols, $arr];
        } else if (preg_match("/INSERT INTO/uis", $query, $foo)) {
            $intopos = strpos($query, "INTO") + 5;
            $valpos = strpos($query, "VALUES");
            $fname = substr($query, $intopos, $valpos-13);
            $vals = substr($query, $valpos+8, -1);
            file_put_contents(self::$path. DIRECTORY_SEPARATOR . $fname,$vals."\r\n",FILE_APPEND);
            return true;
        }

        return false;
    }

    private static function showAllTables() {
        $tables = [];
        $handle = opendir(self::$path);
        while (false !== ($entry = readdir($handle))) {
            if ($entry != "." && $entry != "..") {
                $tables[] = $entry;
            }
        }
        closedir($handle);
        return $tables;
    }

    private function __clone() {
    }
    private function __construct() {
    }
}

Class Tables {
    public function getAllTables() {
        return papperDB::execSQL("SHOW ALL TABLES");
    }
    public function createTable($name, $cols) {
        $q = "CREATE TABLE $name |" . join(",", $cols) . "|";
        if (!papperDB::execSQL($q)) {
            return false;
        }
        return true;
    }
    public function getTable($name) {
        return new Table($name);
    }
}

Class Table {
    public $cols = [];
    public $data = [];
    private $name = '';

    public function addNewData($data) {
        return papperDB::execSQL("INSERT INTO " . $this->name . " VALUES (" . join(",", $data) . ")");
    }

    function __construct($name) {
        $this->name = $name;
        $tmp = papperDB::execSQL("SELECT * FROM $name");
        if ($tmp !== false) {
            $this->cols = $tmp[0];
            $this->data = $tmp[1];
        }
    }
}