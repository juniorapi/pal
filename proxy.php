<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$url = 'https://aiondestiny.net/ajax/api/getonline?_=' . time();
$response = file_get_contents($url);

if ($response !== false) {
    echo $response;
} else {
    echo json_encode(['error' => 'Не вдалося отримати дані з API']);
}
?>
