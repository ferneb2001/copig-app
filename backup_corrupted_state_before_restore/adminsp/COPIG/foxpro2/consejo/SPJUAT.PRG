procedure spjuat
*actualiza archivo de especialidades
@04,01 clear to 23,78
@04,24 say 'ACTUALIZACION ARCHIVO DE ESPECIALIDADES'
@08,02 say 'Codigo  P   Especialidad (singular)        Espec. Plural'
select 1
use spjuti order tijunum
wsigue='S'
wop=0
do while wsigue='S'
   wtitdesc=space(30)
   wtitplur=space(35)
   wcodigo=space(3)
*   wpadron=space(1)
   @23,01 say 'Indique codigo de espec. <F1>  o <ESC> para salir'
   @10,03 get wcodigo pict '!!!'
   read
   if lastkey()<>27
      if lastkey()=28
         do buscatit
      endif   
      seek(wcodigo)
      if found()
         wtitdesc=tijunom
         wtitplur=tijunop
*         wpadron=tipadron
*         @10,07 say tipadron
         @10,11 say tijunom
         @10,41 say tijunop
         @23,01 clear to 23,78
         wop=1
         @23,35 get wop picture '@*H \<Modificar;\<Salir' size 1,1
         read
         @23,01 clear to 23,78
         if wop=1
*            @20,01 say 'Padr¢n: 1-Ing.Civil 2-Ing.Espec. 3-Ing.Agron 5-Geolog 7-Tcos.Ind'
*            @21,01 say '        8-Agronomia 9-Constructores A-Enologia Z-otros'
*            @12,07 get wpadron
            @12,11 get wtitdesc
            @12,41 get wtitplur
            read
*            replace tipadron with wpadron
            replace tijunom with wtitdesc
            replace tijunop with wtitplur
            @20,01 clear to 20,78
            @21,01 clear to 21,78
         ELSE   
         endif         
      else
*         @20,01 say 'Padr¢n: 1-Ing.Civil 2-Ing.Espec. 3-Ing.Agron 5-Geolog 7-Tcos.Ind'
*         @21,01 say '        8-Agronomia 9-Constructores A-Enologia Z-otros'
*         @10,07 get wpadron
         @10,11 get wtitdesc
         @10,41 get wtitplur
         read
         wop=1
         append blank
         replace tijunum with wcodigo
*         replace tipadron with wpadron
         replace tijunom with wtitdesc
         replace tijunop with wtitplur
         @20,01 clear to 20,78
         @21,01 clear to 21,78
      endif 
   else
      wsigue='N'
   endif   
enddo
close all
@04,01 clear to 23,78
return

procedure buscatit
define window ptit from 08,20 to 21,60 title 'Especialidades'
activate window ptit
select 1
brow in window ptit
deactivate window ptit
wcodigo=tijunum
return
