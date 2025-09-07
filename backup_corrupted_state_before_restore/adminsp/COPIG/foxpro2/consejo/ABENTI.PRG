procedure ABENTI
*actualizacion de entidades varias (Consejos, Revistas, Etc.)
set talk off
set delete on
*clear  all
@04,01 clear to 23,78
@04,22 say 'ACTUALIZACION DE ENTIDADES VARIAS'
@06,10 say 'N£mero '
@07,10 SAY 'C¢digo '
@09,10 SAY 'Raz¢n social 1:'
@10,10 SAY 'Raz¢n social 2:'
@11,10 SAY 'Raz¢n social 3:'
@13,10 SAY 'Direcci¢n    1:'
@14,10 SAY 'Direcci¢n    2:'
@15,10 SAY 'Provincia     :'
@16,10 say 'Pais          :'
@17,10 say 'Telefono      :'
@18,10 say 'Telef-adic    :'
@19,10 say 'Fax           :'
@20,10 say 'Tipo          :'
select 1
use entidades order entnro
wsigue='S'
wnum=0
wcod=0
wnomb1=space(30)
wnomb2=space(30)
wnomb3=space(30)
wdirec1=space(30)
wdirec2=space(30)
wpcia=space(10)
wpais=space(10)
wtelef=space(12)
wtipo=0
wlis=0
do while wsigue='S'
   @23,01 say 'Indique el N£mero, <F1> para ayuda o <ESC> para salir'
   @06,27 get wnum pict '99999'
   read
   @23,01 clear to 23,78
   @08,28 clear to 08,78
   if lastkey()<>27
      if lastkey()=28
         @23,01 say 'Seleccione una entidad y oprima <ESC>'
         define window pent from 10,15 to 20,65 title 'ENTIDADES'
         activate window pent
         select 1
         brow in pent
         deactivate window pent
         @23,01 clear to 23,78
         wnum=entnro
         wnom=entnombre
         @08,23 say wnum pict '99999'
      endif
      seek(wnum)
      if found()
         wnomb1=entnombre
         @09,27 say wnomb1
         @10,27 say entnomb2
         @11,27 say entnomb3
         @13,27 say entdir1
         @14,27 say entdir2
         @15,27 say entpcia
         @16,27 say entpais
         @07,27 say entcod PICT '9'
         @17,27 say enttel
         @20,27 say enttipo
         wcod=entcod
         wnomb2=entnomb2
         wnomb3=entnomb3
         wdirec1=entdir1
         wdirec2=entdir2
         wpcia = entpcia
         wpais = entpais
         wtelef=enttel
         wtipo=enttipo
         wop=1
         @23,22 get wop pict '@*H \<Salir;\<Modificar;\<Eliminar' size 1,1
         read
         if wop=2
            do modifica
         else
            if wop=3
               do borrar
            endif      
         endif          
      else
         @18,29 say 'no existe                    '
         wop=1
         @23,30 get wop pict '@*H \<Salir;\<Ingresar' size 1,1
         read
         if wop=2
            do ingre
         endif          
      endif
   else
      wsigue='N'
   endif   
enddo
@04,01 clear to 23,78
close all
return

procedure modifica
@07,27 get wcod PICT '9'
@09,27 get wnomb1
@10,27 get wnomb2
@11,27 get wnomb3  
@13,27 get wdirec1
@14,27 get wdirec2
@15,27 get wpcia
@16,27 get wpais
@17,27 get wtelef
@20,27 get wtipo
read
select 1
replace entcod   with wcod
replace entnombre with wnomb1
replace entnomb2 with wnomb2
replace entnomb3 with wnomb3
replace entdir1  with wdirec1
replace entdir2  with wdirec2
replace entpcia  with wpcia
replace entpais  with wpais
replace enttel   with wtelef
replace enttipo  with wtipo
@23,01 clear to 23,78
return

procedure borrar
delete
return

procedure ingre
@07,27 get wcod PICT '9'
@09,27 get wnomb1
@10,27 get wnomb2
@11,27 get wnomb3  
@13,27 get wdirec1
@14,27 get wdirec2
@15,27 get wpcia
@16,27 get wpais
@17,27 get wtelef
@20,27 get wtipo
read
select 1
append blank
replace entnro   with wnum
replace entcod   with wcod
replace entnombre with wnomb1
replace entnomb2 with wnomb2
replace entnomb3 with wnomb3
replace entdir1  with wdirec1
replace entdir2  with wdirec2
replace entpcia  with wpcia
replace entpais  with wpais
replace enttel   with wtelef
replace enttipo  with wtipo
@23,01 clear to 23,78
return

