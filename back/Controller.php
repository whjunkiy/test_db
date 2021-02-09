<?php
require_once "MyDB.php";
Class Controller {
    public $Tables = null;

    public function getTables($q) {
        return $this->Tables->getAllTables();
    }

    public function createTable($q) {
        if (!count($q['cols'])) {
            return ["err" => "no cols?"];
        }
        if (!$this->Tables->createTable($q['name'], $q['cols'])) {
            return ["err" => "error"];
        }
        return $this->Tables->getAllTables();
    }

    public function getTableData($q) {
        $table = $this->Tables->getTable($q['table']);
        return ["cols" => $table->cols, "data" => $table->data];
    }

    public function addTableData($q) {
        $table = $this->Tables->getTable($q['table']);
        return $table->addNewData($q['data']);
    }

    function __construct() {
        $this->Tables = new Tables();
    }
 }