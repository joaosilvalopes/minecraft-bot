for i in 1 2 3 4 5 6; do
    (npm run start 33875 $i) &
done
wait