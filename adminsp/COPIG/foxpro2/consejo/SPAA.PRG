PROCEDURE spaa
PARAMETER mpopup mbar
barra=val(str(mbar))
hide popup all
hide menu all
if mbar=1
    do spaap
ENDIF
if mbar=2
   do spaal
ENDIF
if mbar=3
   do spaad
endif   
if mbar=4
   DO spaas
ENDIF
if mbar=5
   do spaac
endif
if mbar=6
   *do noimp
   do spaar
endif
if mbar=7
   do spaat
endif
if mbar=8
   do spaae
endif
if mbar=9
   do spaai
endif
if mbar=10
   do spaan
endif
if mbar=11
   do spaam
endif
if mbar=12
   do spaau
endif   
if mbar=13
   do spaarst
endif
if mbar = 14
   do spa92
endif
if mbar = 15
   do sanac 
endif            
if mbar = 16
   do spaase 
endif            
if mbar = 17
   do spdomic
endif            
if mbar = 18
   do spemail
endif            
show popup actual
show menu pant_01
do pie
close all
RETURN
