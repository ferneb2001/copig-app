procedure asacp
*consulta de asociados 
@04,01 clear to 23,78
@04,28 say 'CONSULTA DE ASOCIADOS '
wmatric=0
wcatego=space(2)
wdctoti=0
wdctonr=0
wsigue='S'
@06,01 say 'MATRICULA       CATEGORIA    '
@06,30 say 'NOMBRE: '
do while wsigue='S'
   wop=1
   @23,15 get wop pict '@*H \<Salir;\<Por Nombre;\<Por Num.Asociado';
       size 1,1 
   read
   @23,01 clear to 23,78
   if wop=1
      wsigue='N'
   else   
      if wop=2
         wnom=space(30)
         @06,30 say 'NOMBRE: '
         @23,01 say 'Indique el nombre del asociado '
         @06,38 get wnom pict '@!'
         read
         SELECT 1 
         use spasocia order asnombre
         define window pnom from 08,05 to 22,75
         activate window pnom
         brow all for asnombre =rtrim(wnom) in pnom
         deactivate window pnom 
*         wkey=str(astipo,1)+str(asnro,8)
            do ver
            select 1 
*            continue
      else
         if wop= 3
            @06,01 say 'Asociado:                    '
            @23,01 say 'Indique el nro.de asociado o <ESC> para salir'  
            @06,11 get wmatric pict '999999'
            read
            @23,01 clear to 23,78
            if lastkey()<>27
               select 1 
               use spasocia order asociado
               seek(wmatric)
               if found()
                  do ver
               else
                  @06,10 say 'No existe asociado'   
               endif
            else
            endif
         endif   
      endif          
   endif
enddo
@04,01 clear to 23,78
close all
return

procedure ver
*select 1
@06,11 say a.asociado
*@06,27 say b.catego
@06,38 say a.asnombre
return