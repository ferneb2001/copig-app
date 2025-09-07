procedure spalrst1
*listado de prof.con restricciones/deudas
wop=1
wope=1
whabili=' '
whab=1
wfecha={  /  /  }
set date to dmy
wfecha=date()
@04,01 clear to 23,78
@04,15 say 'LISTADO DE PROFESIONALES CON RRESTRICCIONES/DEUDAS'
*@06,15 get wope pict '@*H \<Ley 3485;\<Cod.etica;\<Art 46-L.5908;\<Todas' size 1,1
*read
wope1=1
@08,15 get wope1 pict '@*H \<Sin cumplimiento;\<Cumplidos;\<Todos' size 1,1
read
wope2=1
@10,15 get wope2 pict '@*H \<Alfab‚tico;\<Num‚rico' size 1,1
read
@23,30 get wop pict '@*H \<Salir;\<Imprimir' size 1,1
read
if wop=2
   @12,24 SAY 'Aguarde...,voy a armar un archivo' color w/n*
   set exclusive off
   select 1
   use sprestri
   select 2
   use spmatri index spmatri
   select 3
   use spprof index spprof
   SET EXCLUSIVE ON
   select 4
   use sptmsan
   zap
   SET EXCLUSIVE OFF
   set safety off 
   select 1
   go top
   do while not eof()
      wposcu=0
      if wope1 = 3
         wposcu = 1
      else
         if wope1 = 1
            if restrotr = 0
               wposcu = 1
            endif
         else
            if restrotr = 1
               wposcu = 1
            endif
         endif
      endif
      if wposcu = 1                  
            wkey=str(matric,5)+catego
            select 2
            seek(wkey)
            if found()
               wkey2=str(dctipo,1)+str(dcnro,8)
               wposit=0
               select 3
               seek(wkey2)
               if found()
                        select 4
                        append blank
                        replace numero with a.matric
                        replace catego with a.catego
                        replace titulo with b.titulo
*                        replace inciso with a.saninci
                        replace dctipo with b.dctipo
                        replace dcnro  with b.dcnro
                        replace habili with b.habili
                        replace condic with b.condic
                        replace nombre with c.nombre
*                        replace tipo   with a.santipo
*                        replace resoluc with a.sanresol
                        replace fresol with a.restforig
                        replace finic  with a.restfactu
                        replace ffinal with a.restfpago
*                        replace canmatr with a.sancnmat
                        replace codpag  with a.restrotr
*                        replace fpago   with a.sanfpag
*                        replace recibo  with a.sanreci
                        replace importe with a.restimpo
                        replace observ  with a.restrtipo
                        replace nomtit  with a.observac
                   endif   
              * endif
            endif  
      endif
      select 1
      skip
   enddo
   select 4
   if wope2 = 1
      sort to sptmsans on nombre
   else
      sort to sptmsans on catego, numero
   endif
   set safety on
   use sptmsans
   go top
   select 3
   use sptitu order titulo
   select 4
   @12,01 clear to 12,78
   @12,28 say 'En proceso de impresion'
   set console off
   set printer on
   set device to printer
   ???chr(27)+chr(67)+chr(72)
   ???chr(27)+chr(48)
   ???chr(27)+chr(15)
   whoja=0
   wlin=0
   do while not eof()
      if whoja=0
         do titulos
      endif
      if wlin>88
         do titulos
      endif      
      ?numero  pict '99999' 
      ??catego pict 'XX' at 6
      ??nombre           at 9
      ??rtrim(observ)    at 40
      ??rtrim(nomtit)    at 51
      ?? fresol  at 77
      ?? importe at 86
      ?? codpag  at 99
      ?? finic   at 103
      ?? ffinal  at 112
      select 4   
      skip
      wlin=wlin+1
   enddo
   eject
   ???chr(27)+chr(50)
   ???chr(27)+chr(80)
   set printer off
   set device to screen
endif
@04,01 clear to 23,78
close all
return

procedure titulos
if whoja>0
   ? 'Est.= 1 Indica cumplimiento de la restricci¢n'
   eject
endif   
whoja=whoja+1
?'CONSEJO PROFESIONAL DE INGENIEROS Y GEOLOGOS'
?'Mitre 617 - 1 piso  - 5500-MENDOZA'
?'LISTADO DE PROFESIONALES CON RESTRICCIONES/DEUDAS' at 40
wliteral=space(30)
if wope1=1
	wliteral='(No cumplidas a la fecha)     '
else
   if wope1=2
      wliteral='( Levantadas a la fecha )     '
   endif
endif
? wliteral at 43	
?? 'Al: ' AT 75
?? wfecha
?? 'Hoja: ' at 90
?? whoja pict '999'
?'MATR.CAT.  APELLIDO y NOMBRE' 
??'Motivo  ' at 40
??'Descripci¢n' at 51
??'Fecha Or.    Importe Est.Fecha Vto.F.Pago ' at 77
?
wlin=6
return