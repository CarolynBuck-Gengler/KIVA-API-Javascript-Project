<?php
// $WeatherSource = "https://api.forecast.io/forecast/e1d3a233c8488d83a567ef48c2e4c91b/" . $_GET["lat"] . "," . $_GET["lng"];
$KivaRecentActivity = "https://api.kivaws.org/v1/lending_actions/recent.json"; // returns whole thing?
header("Content-Type: application/json");
header("Cache-Control: no-cache");
// readfile($WeatherSource);
readfile($KivaRecentActivity);
?>