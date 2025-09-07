procedure mmm
parameter mbar
hide popup all
hide menu all
if ltrim(str(mbar)) = '1'
   do mm
endif
if ltrim(str(mbar)) = '2'
   do mma
endif
@19,02 clear to 19,78
show menu pant01
do pie
close all
return
      