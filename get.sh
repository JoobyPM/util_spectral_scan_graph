#!/usr/bin/env bash
#chnage IP for particular GW
gw_ip=192.168.55.1
gw_id=$(ssh root@$gw_ip "cat /app/cfg/global_conf.json | jq -r '.gateway_conf.gateway_ID' | tr 'a-z' 'A-Z'")
name=$(date +"%FT_%H-%M-%S")


ssh root@$gw_ip "/lora_util/util_spectral_scan -f 867:0.1:870 -n 65535 -b 25 > rssi_histogram.txt"
scp -r root@$gw_ip:/lora_util/rssi_histogram.csv ./source/$gw_id.$name
scp -r root@$gw_ip:/lora_util/rssi_histogram.txt ./source/$gw_id.$name.txt