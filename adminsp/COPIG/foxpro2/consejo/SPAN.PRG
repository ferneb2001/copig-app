PROCEDURE span
PARAMETER mpopup mbar
barra=val(str(mbar))
hide popup all
hide menu all
if mbar=1
    do span1
ENDIF
if mbar=2
   do span2
ENDIF
if mbar=3
   do span3
endif   
if mbar=4
   DO span4
ENDIF
if mbar=5
   do span5
endif
if mbar=6
   do SPAN6
endif
if mbar=7
   do span7
endif
if mbar=8
   do SPAN8
endif
if mbar=9
   do SPAN9
endif
if mbar=10
   do span10
endif
if mbar=11
   do spaln6
endif
if mbar=12
   do spaln7
endif
if mbar=13
   do span13
endif
if mbar=14
   do span14
endif
show popup actual1
show menu pant_011
do pie
close all
RETURN
