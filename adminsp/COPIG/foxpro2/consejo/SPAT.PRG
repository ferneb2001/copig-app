procedure spat
*actualiza archivo de titulos
@04,01 clear to 23,78
@04,24 say 'ACTUALIZACION ARCHIVO DE TITULOS'
@08,02 say 'Codigo    Titulo                        Titulo Plural'
select 1
use sptitu order titulo
wsigue='S'
wop=0
do while wsigue='S'
   wtitdesc=space(30)
   wtitplur=space(35)
   wcodigo=space(3)
   @23,01 say 'Indique codigo de titulo o <ESC> para salir'
   @10,03 get wcodigo pict '!!!'
   read
   if lastkey()<>27
      seek(wcodigo)
      if found()
         wtitdesc=titdesc
         wtitplur=titplur
         @10,09 say titdesc
         @10,41 say titplur
         @23,01 clear to 23,78
         wop=1
         @23,35 get wop picture '@*H \<Modificar;\<Salir' size 1,1
         read
         @23,01 clear to 23,78
         if wop=1
            @12,09 get wtitdesc
            @12,41 get wtitplur
            read
            replace titdesc with wtitdesc
            replace titplur with wtitplur
         ELSE   
         endif         
      else
         @10,09 get wtitdesc
         @10,41 get wtitplur
         read
         wop=1
         append blank
         replace titulo  with wcodigo
         replace titdesc with wtitdesc
         replace titplur with wtitplur
      endif 
   else
      wsigue='N'
   endif   
enddo
close all
@04,01 clear to 23,78
return
