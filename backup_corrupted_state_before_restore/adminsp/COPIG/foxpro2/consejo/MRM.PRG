procedure mrm
parameter mbar
hide popup all
hide menu all
if ltrim(str(mbar)) = '1'
   do mr
endif
if ltrim(str(mbar)) = '2'
   do mmodif
endif
@19,02 clear to 19,78
show menu pant01
do pie
close all
return
      