#!/usr/bin/env bash


printf "{\n\t\"mints\": [\n" > env.json
id=1
while (("$id" < "16"))
do
    var1=`spl-token create-token --decimals 0 | grep 'Creating token'|cut -f3 -d " "`
    spl-token authorize $var1 mint EA7Cpq8hfUxpHAQaQ1xy3hKaqEUSwQxXQijpZY6ZmJrU
    echo $var1
    echo $var2
    printf "\t\t{\n\t\t\t\"id\": $id,\n" >> env.json
    printf "\t\t\t\"address\": \"$var1\"\n\t\t},\n" >> env.json
    id=$(($id+1))
done

printf "\t]\n}\n" >> env.json

